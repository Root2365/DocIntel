# ==============================================================
# DocIntel AI - Backend Dockerfile (build context: repo root)
# Place at repo root so Render finds it automatically.
# ==============================================================

# ---- Stage 1: Build ----
FROM maven:3.9-eclipse-temurin-21 AS builder

WORKDIR /app

# Copy Maven descriptor first (layer-cached)
COPY backend/pom.xml ./pom.xml

# Download dependencies before copying source (cache layer)
RUN mvn dependency:go-offline -q

# Copy source
COPY backend/src ./src

# Build, skip tests (run them in CI separately)
RUN mvn clean package -DskipTests -q

# ---- Stage 2: Runtime ----
FROM eclipse-temurin:21-jre-alpine

# Non-root user for security
RUN addgroup -S docintel && \
    adduser -S docintel -G docintel

WORKDIR /app

# Uploads directory
RUN mkdir -p /app/uploads && \
    chown -R docintel:docintel /app

# Copy jar from builder
COPY --from=builder /app/target/*.jar app.jar
RUN chown docintel:docintel app.jar

USER docintel

EXPOSE 4000

# JVM tuned for containers
ENTRYPOINT ["java", \
    "-XX:+UseContainerSupport", \
    "-XX:MaxRAMPercentage=75.0", \
    "-XX:InitialRAMPercentage=50.0", \
    "-XX:+ExitOnOutOfMemoryError", \
    "-jar", \
    "app.jar"]
