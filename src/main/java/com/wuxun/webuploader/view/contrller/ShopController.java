package com.wuxun.webuploader.view.contrller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@Controller
public class ShopController {

	@RequestMapping (value = "/shop_buyer.htm", method = RequestMethod.GET)
	public ModelAndView simpleuploader1(HttpServletRequest request, HttpServletResponse response) {
		ModelAndView mv = new ModelAndView();
		mv.setViewName("WEB-INF/hicailiao-assets/user/buyers/module/基本信息.html");
		return mv;
	}
}
