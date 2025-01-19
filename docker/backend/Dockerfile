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

WORKDIR /app
COPY --from=build /build/target/whatsappclone-*.jar /app/

EXPOSE 8088

ENV ACTIVE_PROFILE=${PROFILE}
ENV JAR_VERSION=${APP_VERSION}

CMD java -jar -Dspring.profiles.active=${ACTIVE_PROFILE} whatsappclone-${JAR_VERSION}.jar
