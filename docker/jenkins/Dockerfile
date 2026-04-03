FROM jenkins/jenkins:lts
# Switch to root to install the Docker CLI
USER root

# Install dependencies for adding the Docker repository
RUN apt-get update && apt-get install -y \
    lsb-release \
    curl \
    ca-certificates \
    gnupg

# Add Docker's official GPG key
RUN mkdir -p /etc/apt/keyrings && \
    curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set up the repository
RUN echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install the Docker CLI only (no need for the full engine as we connect via socket)
RUN apt-get update && apt-get install -y docker-ce-cli

# Switch back to root temporarily if we want to run as root by default,
# or back to jenkins if we prefer. Given the compose 'user: root', we stay as root.
USER root
