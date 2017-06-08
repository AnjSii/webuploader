package com.wuxun.webuploader.view.contrller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class TestController {

	@RequestMapping("/testVelocity.htm")
	public String testVelocity(Model model) {

		model.addAttribute("sayHi", "Hello World!");
		model.addAttribute("velocity", "This is velocity");

		return "testVelocitiy";
	}
}
