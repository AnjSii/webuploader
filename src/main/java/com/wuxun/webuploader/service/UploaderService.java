package com.wuxun.webuploader.service;

import java.util.List;

import javax.servlet.http.HttpServletRequest;

import com.wuxun.webuploader.entity.UploadResult;

/**
 * Created by 29416 on 2017/6/8.
 */
public interface UploaderService {

	/**
	 * 图片上传
	 * @param request 请求
	 * @param basePath 基础路径 以/开头
	 * @param formFileName 表单中file的name值
	 * @param folder 上传目标文件夹 以/开头
	 * @param allowedPattern 允许的格式
	 * @param fileSize 允许上传的大小 单位KB
	 * @return UploadResult
	 */
	UploadResult saveFile(HttpServletRequest request, String basePath, String formFileName, String folder,
						List<String> allowedPattern, long fileSize);
}
