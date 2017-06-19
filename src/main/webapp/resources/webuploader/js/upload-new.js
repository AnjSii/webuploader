(function ($) {
	var BASE_URL = "/webuploader";
	// 当domReady的时候开始初始化
	$(function () {
		var $wrap = $('#uploader'),
			// 图片容器
			$queue = $('<ul class="filelist"></ul>')
				.appendTo($wrap.find('.queueList')),
			// 状态栏，包括进度和控制按钮
			$statusBar = $wrap.find('.statusBar'),
			// 文件总体选择信息。
			$info = $statusBar.find('.info'),
			// 上传按钮
			$upload = $wrap.find('.uploadBtn'),
			// 没选择文件之前的内容。
			$placeHolder = $wrap.find('.placeholder'),
			$progress = $statusBar.find('.progress').hide(),
			// 添加的文件数量
			fileCount = 0,
			// 添加的文件总大小
			fileSize = 0,
			// 优化retina, 在retina下这个值是2
			ratio = window.devicePixelRatio || 1,
			// 缩略图大小
			thumbnailWidth = 110 * ratio,
			thumbnailHeight = 110 * ratio,
			// 可能有pedding, ready, uploading, confirm, done.
			state = 'pedding',
			// 所有文件的进度信息，key为file id
			percentages = {},
			// 判断浏览器是否支持图片的base64
			isSupportBase64 = (function () {
				var data = new Image();
				var support = true;
				data.onload = data.onerror = function () {
					if (this.width != 1 || this.height != 1) {
						support = false;
					}
				};
				data.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
				return support;
			})(),

			supportTransition = (function () {
				var s = document.createElement('p').style,
					r = 'transition' in s ||
						'WebkitTransition' in s ||
						'MozTransition' in s ||
						'msTransition' in s ||
						'OTransition' in s;
				s = null;
				return r;
			})(),

			// 实例化
			uploader = WebUploader.create({
				fileVal: 'MyFiledName', //设置文件上传域的name。
				pick: { //指定选择文件的按钮容器，不指定则不创建按钮。
					id: '#filePicker',
					label: '点击选择图片'
				},
				formData: { //文件上传请求的参数表，每次发送都会发送此对象中的参数。
					uid: 123
				},
				prepareNextFile: true, //是否允许在文件传输时提前把下一个文件准备好。 对于一个文件的准备工作比较耗时，比如图片压缩，md5序列化。 如果能提前在当前文件传输期处理，可以节省总体耗时。
				compress: false, //配置压缩的图片的选项。如果此选项为false, 则图片在上传前不进行压缩。
				dnd: '#uploader', //指定Drag And Drop拖拽的容器，如果不指定，则不启动。
				paste: '#uploader', //指定监听paste事件的容器，如果不指定，不启用此功能。此功能为通过粘贴来添加截屏的图片
				chunked: false, //是否要分片处理大文件上传。
				//chunkSize: 512 * 1024, //如果要分片，分多大一片？ 默认大小为5M。
				server: BASE_URL + '/upload.htm', //控制层url
				// runtimeOrder: 'flash', //指定运行时启动顺序。默认会想尝试 html5 是否支持，如果支持则使用 html5, 否则则使用 flash。
				accept: { //指定接受哪些类型的文件。 由于目前还有ext转mimeType表，所以这里需要分开指定。
					title: 'Images',
					extensions: 'gif,jpg,jpeg,bmp,png',
					mimeTypes: 'image/gif,image/jpg,image/jpeg,image/bmp,image/png'
				},
				disableGlobalDnd: true, //是否禁掉整个页面的拖拽功能，如果不禁用，图片拖进来的时候会默认被浏览器打开。
				fileNumLimit: 300, //验证文件总数量, 超出则不允许加入队列。
				fileSizeLimit: 200 * 1024 * 1024, //验证文件总大小是否超出限制, 超出则不允许加入队列。 200M
				fileSingleSizeLimit: 50 * 1024 * 1024 //验证单个文件大小是否超出限制, 超出则不允许加入队列。 50M
			});

		//阻止此事件可以拒绝某些类型的文件拖入进来。拖拽时不接受 js, txt 文件。
		uploader.on('dndAccept', function (items) {
			var denied = false,
				len = items.length,
				i = 0,
				// 修改js类型
				unAllowed = 'text/plain;application/javascript ';

			for (; i < len; i++) {
				// 如果在列表里面
				if (~unAllowed.indexOf(items[i].type)) {
					denied = true;
					break;
				}
			}

			return !denied;
		});

		//当某个文件上传到服务端响应后，会派送此事件来询问服务端响应是否有效。
		//如果此事件handler返回值为false, 则此文件将派送server类型的uploadError事件。
		uploader.on('uploadAccept', function (file, response) {
			var hasError = (response['code'] == 1);
			if (hasError) {
				return false;
			}
		});

		//当一批文件添加进队列以后触发。
		// uploader.on('filesQueued', function() {
		//     uploader.sort(function( a, b ) {
		//         if ( a.name < b.name )
		//           return -1;
		//         if ( a.name > b.name )
		//           return 1;
		//         return 0;
		//     });
		// });

		//加载完后启用uoliader
		uploader.on('ready', function () {
			window.uploader = uploader;
		});

		// 添加“添加文件”的按钮，
		uploader.addButton({
			id: '#filePicker2',
			label: '继续添加'
		});

		// 当有文件添加进来时执行，负责view的创建
		function addFile(file) {
			var $li = $('<li id="' + file.id + '">' +
					'<p class="title">' + file.name + '</p>' +
					'<p class="imgWrap"></p>' +
					'<p class="progress"><span></span></p>' +
					'</li>'),

				$btns = $('<div class="file-panel">' +
					'<span class="cancel">删除</span>' +
					'<span class="rotateRight">向右旋转</span>' +
					'<span class="rotateLeft">向左旋转</span></div>').appendTo($li),
				$prgress = $li.find('p.progress span'),
				$wrap = $li.find('p.imgWrap'),
				$info = $('<p class="error"></p>'),

				showError = function (code) {
					switch (code) {
						case 'exceed_size':
							text = '文件大小超出';
							break;

						case 'interrupt':
							text = '上传暂停';
							break;

						default:
							text = '上传失败，请重试';
							break;
					}

					$info.text(text).appendTo($li);
				};

			if (file.getStatus() === 'invalid') {
				showError(file.statusText);
			} else {
				$wrap.text('预览中');
				//生成缩略图，此过程为异步，所以需要传入callback。 通常情况在图片加入队里后调用此方法来生成预览图以增强交互效果。
				//error 如果生成缩略图有错误，此error将为真。
				//src, 缩略图的Data URL值。
				uploader.makeThumb(file, function (error, src) {
					var img;

					if (error) {
						$wrap.text('不能预览');
						return;
					}

					if (isSupportBase64) {
						img = $('<img src="' + src + '">');
						$wrap.empty().append(img);
					} else {
						$wrap.text("预览出错");
					}
				}, thumbnailWidth, thumbnailHeight);

				percentages[file.id] = [file.size, 0];
				file.rotation = 0;
			}

			//文件状态变化
			file.on('statuschange', function (cur, prev) {
				if (prev === 'progress') {
					$prgress.hide().width(0);
				} else if (prev === 'queued') {
					$li.off('mouseenter mouseleave');
					$btns.remove();
				}

				// 成功
				if (cur === 'error' || cur === 'invalid') {
					console.log(file.statusText);
					showError(file.statusText);
					percentages[file.id][1] = 1;
				} else if (cur === 'interrupt') {
					showError('interrupt');
				} else if (cur === 'queued') {
					percentages[file.id][1] = 0;
				} else if (cur === 'progress') {
					$info.remove();
					$prgress.css('display', 'block');
				} else if (cur === 'complete') {
					$li.append('<span class="success"></span>');
				}

				$li.removeClass('state-' + prev).addClass('state-' + cur);
			});

			$li.on('mouseenter', function () {
				$btns.stop().animate({height: 30});
			});

			$li.on('mouseleave', function () {
				$btns.stop().animate({height: 0});
			});

			$btns.on('click', 'span', function () {
				var index = $(this).index(),
					deg;

				switch (index) {
					case 0:
						uploader.removeFile(file);
						return;

					case 1:
						file.rotation += 90;
						break;

					case 2:
						file.rotation -= 90;
						break;
				}

				if (supportTransition) {
					deg = 'rotate(' + file.rotation + 'deg)';
					$wrap.css({
						'-webkit-transform': deg,
						'-mos-transform': deg,
						'-o-transform': deg,
						'transform': deg
					});
				} else {
					$wrap.css('filter', 'progid:DXImageTransform.Microsoft.BasicImage(rotation='
						+ (~~((file.rotation / 90) % 4 + 4) % 4) + ')');
				}
			});
			$li.appendTo($queue);
		}

		// 负责view的销毁
		function removeFile(file) {
			var $li = $('#' + file.id);
			delete percentages[file.id];
			updateTotalProgress();
			$li.off().find('.file-panel').off().end().remove();
		}

		function updateTotalProgress() {
			var loaded = 0,
				total = 0,
				spans = $progress.children(),
				percent;

			$.each(percentages, function (k, v) {
				total += v[0];
				loaded += v[0] * v[1];
			});
			percent = total ? loaded / total : 0;

			spans.eq(0).text(Math.round(percent * 100) + '%');
			spans.eq(1).css('width', Math.round(percent * 100) + '%');
			updateStatus();
		}

		function updateStatus() {
			var text = '', stats;
			if (state === 'ready') {
				text = '选中' + fileCount + '张图片，共' +
					WebUploader.formatSize(fileSize) + '。';
			} else if (state === 'confirm') {
				stats = uploader.getStats();
				if (stats.uploadFailNum) {
					text = '已成功上传' + stats.successNum + '张照片至XX相册，' +
						stats.uploadFailNum
						+ '张照片上传失败，<a class="retry" href="#">重新上传</a>失败图片或<a class="ignore" href="#">忽略</a>'
				}
			} else {
				stats = uploader.getStats();
				text = '共' + fileCount + '张（' +
					WebUploader.formatSize(fileSize) +
					'），已成功上传' + stats.successNum + '张';
				if (stats.uploadFailNum) {
					text += '，失败' + stats.uploadFailNum + '张';
				}
			}
			$info.html(text);
		}

		function setState(val) {
			var file, stats;

			if (val === state) {
				return;
			}

			$upload.removeClass('state-' + state);
			$upload.addClass('state-' + val);
			state = val;

			switch (state) {
				case 'pedding':
					$placeHolder.removeClass('element-invisible');
					$queue.hide();
					$statusBar.addClass('element-invisible');
					uploader.refresh();
					break;

				case 'ready':
					$placeHolder.addClass('element-invisible');
					$('#filePicker2').removeClass('element-invisible');
					$queue.show();
					$statusBar.removeClass('element-invisible');
					uploader.refresh();
					break;

				case 'uploading':
					$('#filePicker2').addClass('element-invisible');
					$progress.show();
					$upload.text('暂停上传');
					break;

				case 'paused':
					$progress.show();
					$upload.text('继续上传');
					break;

				case 'confirm':
					$progress.hide();
					$('#filePicker2').removeClass('element-invisible');
					$upload.text('开始上传');

					stats = uploader.getStats();
					if (stats.successNum && !stats.uploadFailNum) {
						setState('finish');
						return;
					}
					break;
				case 'finish':
					stats = uploader.getStats();
					if (stats.successNum) {
						//alert('上传成功');
					} else {
						// 没有成功的图片，重设
						state = 'done';
						location.reload();
					}
					break;
			}
			updateStatus();
		}

		//上传过程中触发，携带上传进度。
		uploader.onUploadProgress = function (file, percentage) {
			var $li = $('#' + file.id),
				$percent = $li.find('.progress span');

			$percent.css('width', percentage * 100 + '%');
			percentages[file.id][1] = percentage;
			updateTotalProgress();
		};

		//当文件被加入队列以后触发。
		uploader.onFileQueued = function (file) {
			fileCount++;
			fileSize += file.size;
			if (fileCount === 1) {
				$placeHolder.addClass('element-invisible');
				$statusBar.show();
			}
			addFile(file);
			setState('ready');
			updateTotalProgress();
		};

		//当文件被移除队列后触发。
		uploader.onFileDequeued = function (file) {
			fileCount--;
			fileSize -= file.size;
			if (!fileCount) {
				setState('pedding');
			}
			removeFile(file);
			updateTotalProgress();
		};

		//on的一个特殊事件all, 所有的事件触发都会响应到这里。
		uploader.on('all', function (type) {
			var stats;
			switch (type) {
				case 'uploadFinished':
					setState('confirm');
					break;

				case 'startUpload':
					setState('uploading');
					break;

				case 'stopUpload':
					setState('paused');
					break;

			}
		});

		//当validate不通过时，会以派送错误事件的形式通知调用者。
		//通过upload.on('error', handler)可以捕获到此类错误，目前有以下错误会在特定的情况下派送错来。
		//Q_EXCEED_NUM_LIMIT 在设置了fileNumLimit且尝试给uploader添加的文件数量超出这个值时派送。
		//Q_EXCEED_SIZE_LIMIT 在设置了Q_EXCEED_SIZE_LIMIT且尝试给uploader添加的文件总大小超出这个值时派送。
		//Q_TYPE_DENIED 当文件类型不满足时触发。
		uploader.onError = function (code) {
			if (code == "Q_TYPE_DENIED") {
				alert("请上传" + uploader.option("accept")[0].extensions +"格式的文件");
			} else if (code == "F_EXCEED_SIZE") {
				alert("文件大小不能超过" + uploader.option("fileSingleSizeLimit")/(1024*1024) + "M");
			} else if (code == "F_DUPLICATE") {
				alert("文件重复");
			} else if (code == "Q_EXCEED_NUM_LIMIT") {
				alert("添加图片数量超出" + uploader.option("fileNumLimit"));
			} else if (code == "Q_EXCEED_SIZE_LIMIT") {
				alert("添加图片总大小超出" + uploader.option("fileSizeLimit")/(1024*1024) + "M");
			}
		};

		$upload.on('click', function () {
			if ($(this).hasClass('disabled')) {
				return false;
			}
			if (state === 'ready') {
				uploader.upload(); //开始上传。此方法可以从初始状态调用开始上传流程，也可以从暂停状态调用，继续上传流程。
			} else if (state === 'paused') {
				uploader.upload();
			} else if (state === 'uploading') {
				uploader.stop();
			}
		});

		uploader.on('uploadFinished',function () {
			var ret = true;
			var stats = uploader.getStats();
			for (var i = 0; i < uploader.getFiles().length; i++) {
				if ($("#" + uploader.getFiles()[i].id).attr('class') == "state-error") {
					ret = false;
					break;
				}
			}
			if (ret) {
				$info.html("");
				setTimeout(function () {
					alert('共' + fileCount + '张（' +
						WebUploader.formatSize(fileSize) +
						'），已成功上传' + stats.successNum + '张');
					uploader.destroy();
					window.location.reload();
				}, 1000);
			}
		});

		$info.on('click', '.retry', function () {
			uploader.retry();
		});

		$info.on('click', '.ignore', function () {
			for (var i = 0; i < uploader.getFiles().length; i++) {
				if ($("#" + uploader.getFiles()[i].id).attr('class') == "state-error") {
					// 将图片从上传序列移除
					uploader.removeFile(uploader.getFiles()[i]);
					//uploader.removeFile(uploader.getFiles()[i], true);
					//delete uploader.getFiles()[i];
					// 将图片从缩略图容器移除
					var $li = $('#' + uploader.getFiles()[i].id);
					$li.off().remove();
				}
				fileSize -= uploader.getFiles()[i].size;
			}
			if (fileCount == 0) {
				setState('pedding');
				fileSize = 0;
				uploader.reset();
				updateStatus();
			} else {
				var showInfo = '共' + fileCount + '张（' +
					WebUploader.formatSize(fileSize) +
					'），已成功上传' + uploader.getStats().successNum + '张';
				$info.html(showInfo);
			}
		});

		$upload.addClass('state-' + state);
		updateTotalProgress();
	});
})(jQuery);