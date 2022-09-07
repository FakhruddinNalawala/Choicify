package com.choicify.backend;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
@RequestMapping(path = "/api")
public class NextTestController {

    @GetMapping(path = "/next")
    public @ResponseBody String testNextRequest() {
        return "Hello from Spring";
    }
}
