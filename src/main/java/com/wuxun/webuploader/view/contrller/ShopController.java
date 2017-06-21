package com.wuxun.webuploader.view.contrller;

import com.wuxun.webuploader.entity.UploadResult;
import com.wuxun.webuploader.service.UploaderService;
import org.nutz.json.Json;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.Map;

/**
 * Created by 29416 on 2017/6/8.
 */
@Controller
public class ShopController {

	@Autowired
	UploaderService uploaderService;

	@RequestMapping (value = "/shop.htm", method = RequestMethod.GET)
	public ModelAndView view(HttpServletRequest request, HttpServletResponse response) {
		ModelAndView mv = new ModelAndView();
		mv.setViewName("WEB-INF/view/shop.html");
		return mv;
	}

	@RequestMapping (value = "/shop_upload.htm", method = RequestMethod.POST)
	public void upload(HttpServletRequest request, HttpServletResponse response) {
		String win_userName = System.getProperty("user.name");
		UploadResult result = this.uploaderService
				.saveFile(request, "C:/Users/" + win_userName + "/Desktop", "MyFiledName",
						"/webuploader", null, 1024 * 1024);
		Map<String, Object> json_map = new HashMap<>();
		json_map.put("code", result.getCode());
		json_map.put("desc", result.getDesc());
		try {
			PrintWriter writer = response.getWriter();
			writer.print(Json.toJson(json_map));
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
}
