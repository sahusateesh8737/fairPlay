FROM jenkins/jenkins:lts

# Switch to root to install the Docker CLI
USER root

# Install dependencies for adding the Docker repository
RUN apt-get update && apt-get install -y \
    lsb-release \
    curl \
    ca-certificates \
    gnupg \
    git

# Add Docker's official GPG key
RUN mkdir -p /etc/apt/keyrings && \
    curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set up the repository
RUN echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install the Docker CLI only
RUN apt-get update && apt-get install -y docker-ce-cli

# Disable the initial setup wizard manually
ENV JAVA_OPTS="-Djenkins.install.runSetupWizard=false"

# Switch back to the jenkins user for plugin installation
USER jenkins

# Copy and install plugins
COPY --chown=jenkins:jenkins docker/jenkins/plugins.txt /usr/share/jenkins/ref/plugins.txt
RUN jenkins-plugin-cli -f /usr/share/jenkins/ref/plugins.txt

# Post-installation: switch to root if we need to run as root (for socket access)
USER root
