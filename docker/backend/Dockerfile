# Build stage
FROM maven:3.9.9-eclipse-temurin-21-alpine AS build
WORKDIR /build
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn clean package -DskipTests


# Runtime stage
FROM eclipse-temurin:21-jdk-alpine
# we pass arguments when we build the image
ARG PROFILE=prod
ARG APP_VERSION=1.0
ARG ISSUER_URI
ARG DATABASE_URL
ARG DATABASE_USERNAME
ARG DATABASE_PASSWORD
ARG CORS_ORIGIN

WORKDIR /app
COPY --from=build /build/target/whatsappclone-*.jar /app/

EXPOSE 8088

ENV ACTIVE_PROFILE=${PROFILE}
ENV JAR_VERSION=${APP_VERSION}
ENV ENV_ISSUER_URI=${ISSUER_URI}
ENV ENV_DATABASE_URL=${DATABASE_URL}
ENV ENV_DATABASE_USERNAME=${DATABASE_USERNAME}
ENV ENV_DATABASE_PASSWORD=${DATABASE_PASSWORD}
ENV ENV_CORS_ORIGIN=${CORS_ORIGIN}

#CMD java -jar whatsappclone-${JAR_VERSION}.jar -Dspring.profiles.active=${ACTIVE_PROFILE}
#CMD java -jar whatsappclone-${JAR_VERSION}.jar -Dspring.profiles.active=${ACTIVE_PROFILE} --ISSUER_URI=${ENV_ISSUER_URI} --DATABASE_URL=${ENV_DATABASE_URL} --DATABASE_USERNAME=${ENV_DATABASE_USERNAME} --DATABASE_PASSWORD=${ENV_DATABASE_PASSWORD} --CORS_ORIGIN=${ENV_CORS_ORIGIN}
#CMD ["java", "-jar", "whatsappclone-1.0.jar", "-Dspring.profiles.active=prod", "--ISSUER_URI=http://keycloak:9090/realms/whatsapp-clone", "--DATABASE_URL=jdbc:postgresql://aws-0-eu-central-1.pooler.supabase.com:5432/postgres", "--DATABASE_USERNAME=postgres.gixbrkvvcijjrklvgxwq", "--DATABASE_PASSWORD=L3yzLHOIt4UkqYau", "--CORS_ORIGIN=http://localhost:4200,https://whatsapp-clone.sonnydevtest.de,https://www.whatsapp-clone.sonnydevtest.de"]
CMD ["java", "-jar", "whatsappclone-${JAR_VERSION}.jar", "-Dspring.profiles.active=${ACTIVE_PROFILE}", "--ISSUER_URI=${ENV_ISSUER_URI}", "--DATABASE_URL=${ENV_DATABASE_URL}", "--DATABASE_USERNAME=${ENV_DATABASE_USERNAME}", "--DATABASE_PASSWORD=${ENV_DATABASE_PASSWORD}", "--CORS_ORIGIN=${ENV_CORS_ORIGIN}"]
