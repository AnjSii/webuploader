jq1124(function ($) {
	var BASE_URL = "/webuploader";
	// 当domReady的时候开始初始化
	jq1124(function() {
		var $ = jq1124,
			state = 'pending',
			uploader;

		uploader = WebUploader.create({
			fileVal: 'MyFiledName', //设置文件上传域的name。
			resize: false, // 不压缩image, 默认如果是jpeg，文件上传前会压缩一把再上传！
			disableGlobalDnd: true,
			dnd: '.tabimgcent',
			server: BASE_URL + '/shop_upload.htm', //控制层url
			// 选择文件的按钮。可选。
			// 内部根据当前运行是创建，可能是input元素，也可能是flash.
			pick: '#picker',
			auto:true
		});

		uploader.on('ready', function () {
			$(".webuploader-container").css("left", "173px");
			$(".webuploader-container").css("top", "12px");
			$(".tabimgcent").css("border", "3px dashed #e6e6e6");
			$(".tabimgcent").css("height", "87px");
			$(".tabimgcent").css("width", "454px");
			$(".tabimgcent").css("margin-left", "5px");
		});

		// 当有文件被添加进队列的时候
		uploader.on( 'fileQueued', function( file ) {
		});

		// 文件上传过程中创建进度条实时显示。
		uploader.on( 'uploadProgress', function( file, percentage ) {
		});

		uploader.on( 'uploadSuccess', function( file, response ) {
			var stats = uploader.getStats();
			var url = response['url'];
			if(stats.successNum==1) {
				jQuery("#goods_image_0").attr("src", url[stats.successNum-1]);
			}
			jQuery("#goods_image_"+stats.successNum).attr("src",url[stats.successNum-1]);
			/*jQuery("#goods_image_"+stats.successNum).attr("image_id",obj.id);*/
		});

		uploader.on( 'uploadError', function( file ) {
			$( '#'+file.id ).find('p.state').text('上传出错');
		});

		uploader.on( 'uploadComplete', function( file ) {
			$( '#'+file.id ).find('.progress').fadeOut();
		});

		uploader.on( 'all', function( type ) {
			if ( type === 'startUpload' ) {
				state = 'uploading';
			} else if ( type === 'stopUpload' ) {
				state = 'paused';
			} else if ( type === 'uploadFinished' ) {
				state = 'done';
			}
		});
	});
});