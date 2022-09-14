package com.choicify.backend.security;

import com.choicify.backend.config.AppConfig;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.io.UnsupportedEncodingException;
import java.util.Base64;

@Slf4j
@Service
@RequiredArgsConstructor
public class TokenProvider {

    private final AppConfig appConfig;

    public String createToken(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + appConfig.getTokenExpirationMsec());

        byte[] tokenSecret = Base64.getEncoder().encode(appConfig.getTokenSecret().getBytes());
        SecretKey key = Keys.hmacShaKeyFor(tokenSecret);

        return Jwts.builder()
                .setSubject(Long.toString(userPrincipal.getId()))
                .setIssuedAt(new Date())
                .setExpiration(expiryDate)
                .signWith(key, SignatureAlgorithm.HS512)
//                .signWith(SignatureAlgorithm.HS512, appConfig.getTokenSecret())
                .compact();
    }

    public Long getUserIdFromToken(String token) {
        byte[] tokenSecret = Base64.getEncoder().encode(appConfig.getTokenSecret().getBytes());
        Claims claims = Jwts.parserBuilder().setSigningKey(tokenSecret).build().parseClaimsJws(token).getBody();

        return Long.parseLong(claims.getSubject());
    }

    public boolean validateToken(String authToken) {
        try {
            byte[] tokenSecret = Base64.getEncoder().encode(appConfig.getTokenSecret().getBytes());
            Jwts.parserBuilder().setSigningKey(tokenSecret).build().parseClaimsJws(authToken);
            return true;
        } catch (SignatureException ex) {
            log.error("Invalid JWT signature");
        } catch (MalformedJwtException ex) {
            log.error("Invalid JWT token");
        } catch (ExpiredJwtException ex) {
            log.error("Expired JWT token");
        } catch (UnsupportedJwtException ex) {
            log.error("Unsupported JWT token");
        } catch (IllegalArgumentException ex) {
            log.error("JWT claims string is empty.");
        }
        return false;
    }

}
