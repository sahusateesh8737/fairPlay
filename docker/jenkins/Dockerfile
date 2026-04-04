FROM jenkins/jenkins:lts

# Switch to root to install required packages
USER root

# Install the Docker CLI using the modern Debian setup approach
RUN apt-get update && \
    apt-get install -y ca-certificates curl

RUN install -m 0755 -d /etc/apt/keyrings && \
    curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc && \
    chmod a+r /etc/apt/keyrings/docker.asc

RUN echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian \
    $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
    tee /etc/apt/sources.list.d/docker.list > /dev/null

RUN apt-get update && \
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Add jenkins user to docker group (optional, but good practice if socket permissions aren't permissive)
# On macOS the /var/run/docker.sock often works directly, but let's ensure jenkins can use docker
RUN groupadd -f docker && usermod -aG docker jenkins || true

# Switch back to the jenkins user
USER jenkins
