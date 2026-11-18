package com.docintel.backend.Config;

import java.io.IOException;

import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingResponseWrapper;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
@Slf4j
public class RequestTimingFilter extends OncePerRequestFilter {

    private static final String RESPONSE_TIME_HEADER =
            "X-Response-Time-Ms";

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        long startTime = System.currentTimeMillis();

        ContentCachingResponseWrapper responseWrapper =
                new ContentCachingResponseWrapper(response);

        try {

            filterChain.doFilter(
                    request,
                    responseWrapper
            );

        } finally {

            long duration =
                    System.currentTimeMillis() - startTime;

            responseWrapper.setHeader(
                    RESPONSE_TIME_HEADER,
                    String.valueOf(duration)
            );

            log.info(
                    "{} {} -> {} ({} ms)",
                    request.getMethod(),
                    request.getRequestURI(),
                    responseWrapper.getStatus(),
                    duration
            );

            responseWrapper.copyBodyToResponse();
        }
    }
}
