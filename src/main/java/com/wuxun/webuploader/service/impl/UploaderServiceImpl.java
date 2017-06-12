package com.wuxun.webuploader.service.impl;

import java.io.File;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import com.wuxun.webuploader.entity.UploadResult;
import com.wuxun.webuploader.service.UploaderService;

/**
 * Created by 29416 on 2017/6/8.
 */
@Service
public class UploaderServiceImpl implements UploaderService {

	private static final Log log = LogFactory.getLog(UploadResult.class);

	@Override
	public UploadResult getUploadResult(HttpServletRequest request, String basePath, String formFileName, String dir,
										List<String> allowedPattern, long fileSize) {

		String successCode = UploadResult.CODE_0;
		String successInfo = UploadResult.DESC_0;
		String falseCode = UploadResult.CODE_1;
		String falseInfo = UploadResult.DESC_3;

		UploadResult result = new UploadResult();
		/*提供其他方法，以处理一个简单的servlet请求中的部分内容，允许上载文件的访问*/
		MultipartHttpServletRequest multipartHttpServletRequest = (MultipartHttpServletRequest) request;

		File file = new File(basePath + dir);
		if (!file.exists() && !file.mkdirs()) {
			log.error("upload mkdirs failed");
			throw new RuntimeException("upload mkdirs failed.");
		}

		/* 页面控件的文件流 */
		List<String> list = new ArrayList<>();
		List<MultipartFile> multipartFileList = multipartHttpServletRequest.getFiles(formFileName);
		if (multipartFileList.isEmpty()) {
			result.setCode(falseCode);
			list.add(UploadResult.EMPTY_URL);
			result.setUrls(list);
			result.setDesc(falseInfo);
			return result;
		}

		if (allowedPattern == null || allowedPattern.size() == 0) {
			allowedPattern = new ArrayList<>();
			allowedPattern.add(".gif");
			allowedPattern.add(".jpg");
			allowedPattern.add(".jpeg");
			allowedPattern.add(".png");
		}

		if (fileSize <= 0) {
			fileSize = 1 * 1024 * 1024;
		} else {
			fileSize *= 1024;
		}
		try {
			for (MultipartFile multipartFile : multipartFileList) {
				String originalFilename = multipartFile.getOriginalFilename();
				if (originalFilename.isEmpty()) {
					result.setCode(falseCode);
					list.add(UploadResult.EMPTY_URL);
					result.setUrls(list);
					result.setDesc(falseInfo);
					return result;
				}
				/* 获取文件的后缀 */
				String suffix = originalFilename.substring(originalFilename.lastIndexOf("."));
				if (!allowedPattern.contains(suffix.toLowerCase())) {
					result.setCode(UploadResult.CODE_1);
					result.setUrls(null);
					result.setDesc(UploadResult.DESC_1);
					return result;
				}
				if (multipartFile.getSize() > fileSize) {
					result.setCode(UploadResult.CODE_2);
					result.setUrls(null);
					result.setDesc(String.format(UploadResult.DESC_2, fileSize));
					return result;
				}
				/* 使用时间戳生成文件名称 */
				SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMddHHmmssSSS");
				String nowTime = sdf.format(new Date());
				String filename = nowTime + suffix; // 构建文件名称

				/*拼成完整的文件保存路径加文件*/
				String fullFilename = file + "/" + filename;
				File file1 = new File(fullFilename);
				multipartFile.transferTo(file1);
				list.add(dir + "/" + filename);
			}
			result.setCode(successCode);
			result.setUrls(list);
			result.setDesc(successInfo);
		} catch (IllegalStateException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
		log.info("返回内容为：" + result.toString());
		return result;
	}
}
