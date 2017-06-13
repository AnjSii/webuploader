package com.wuxun.webuploader.entity;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by 29416 on 2017/6/8.
 */
public class UploadResult {

	public static final String CODE_0 = "0"; //上传成功返回码

	public static final String CODE_1 = "1"; //上传失败返回码

	/* 成功 success */
	public static final String DESC_0 = "成功";

	/*上传文件失败*/
	public static final String DESC_1 = "获取文件失败";

	/*上传文件失败*/
	public static final String DESC_2 = "上传文件失败";

	/* 上传文件格式不正确*/
	public static final String DESC_3 = "上传文件格式不正确";

	/* 上传文件大小超过了规定的大小 */
	public static final String DESC_4 = "上传文件大小超过了规定的大小";

	/* 空路径 */
	public static final String EMPTY_URL = "";

	private String code; // 返回码

	private String desc; // 描述

	List<String> urls = new ArrayList<>(); // 上传文件路径的集合

	public String getCode() {
		return code;
	}

	public void setCode(String code) {
		this.code = code;
	}

	public String getDesc() {
		return desc;
	}

	public void setDesc(String desc) {
		this.desc = desc;
	}

	public void setUrls(List<String> urls) {
		this.urls = urls;
	}

	public List<String> getUrls() {
		return urls;
	}

	@Override
	public String toString() {
		return "UploadResult [code=" + code + ", desc=" + desc + ", urls=" + urls + "]";
	}
}
