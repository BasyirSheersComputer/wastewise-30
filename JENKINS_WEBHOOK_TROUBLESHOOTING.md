# 🔧 Jenkins Webhook Troubleshooting Guide

## 🚨 **Issue: Git Push Not Triggering Jenkins Pipeline**

The webhook from GitHub to Jenkins is not working properly. Let's troubleshoot this step by step.

## 📋 **Step-by-Step Troubleshooting**

### **1. Verify GitHub Webhook Configuration**

#### **Check Webhook URL:**
- Go to your GitHub repository: `https://github.com/BasyirSheersComputer/wastewise-30`
- Navigate to **Settings** → **Webhooks**
- Verify the webhook URL points to your Jenkins server
- **Expected URL**: `http://your-jenkins-server/github-webhook/`

#### **Check Webhook Events:**
- Ensure these events are selected:
  - ✅ **Push** (triggers on git push)
  - ✅ **Pull Request** (optional)
  - ✅ **Repository** (optional)

#### **Check Webhook Status:**
- Look for recent delivery attempts
- Check if deliveries are successful (200 status) or failing
- If failing, check the error messages

### **2. Verify Jenkins Configuration**

#### **Check Jenkins Job Configuration:**
1. **Open Jenkins**: Navigate to your Jenkins server
2. **Find Job**: Look for the `wastewise-30` job
3. **Check Configuration**:
   - **Source Code Management**: Should be set to Git
   - **Repository URL**: `https://github.com/BasyirSheersComputer/wastewise-30.git`
   - **Branches**: Should include `main` or `*/main`
   - **Build Triggers**: Should have "GitHub hook trigger for GITScm polling" enabled

#### **Check Jenkins System Configuration:**
1. **Manage Jenkins** → **Configure System**
2. **GitHub** section:
   - **GitHub Server**: Should be configured
   - **API URL**: `https://api.github.com`
   - **Credentials**: Should be set up

### **3. Test Webhook Manually**

#### **Test from GitHub:**
1. Go to **Settings** → **Webhooks**
2. Click on your webhook
3. Scroll down to **Recent Deliveries**
4. Click **Redeliver** on the latest delivery
5. Check the response

#### **Test from Jenkins:**
```bash
# Check if Jenkins is accessible
curl -I http://your-jenkins-server/

# Test webhook endpoint
curl -X POST http://your-jenkins-server/github-webhook/ \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Event: push" \
  -d '{"ref":"refs/heads/main","repository":{"full_name":"BasyirSheersComputer/wastewise-30"}}'
```

### **4. Check Jenkins Logs**

#### **View Jenkins Logs:**
1. **Manage Jenkins** → **System Log**
2. Look for errors related to:
   - GitHub webhook processing
   - Job triggering
   - Authentication issues

#### **Check Job Logs:**
1. Go to your `wastewise-30` job
2. Click **Build History**
3. Check if builds are being triggered
4. Look for error messages in failed builds

### **5. Common Issues and Solutions**

#### **Issue 1: Webhook URL Incorrect**
**Symptoms**: 404 errors in webhook deliveries
**Solution**: 
```bash
# Correct webhook URL format
http://your-jenkins-server/github-webhook/
# NOT
http://your-jenkins-server/job/wastewise-30/
```

#### **Issue 2: Jenkins Not Accessible**
**Symptoms**: Connection refused or timeout
**Solution**:
```bash
# Check if Jenkins is running
sudo systemctl status jenkins

# Restart Jenkins if needed
sudo systemctl restart jenkins

# Check firewall
sudo ufw status
```

#### **Issue 3: Authentication Issues**
**Symptoms**: 401/403 errors
**Solution**:
1. **GitHub Credentials**: Ensure GitHub credentials are configured in Jenkins
2. **Webhook Secret**: If using webhook secrets, ensure they match
3. **Permissions**: Ensure Jenkins has permission to access the repository

#### **Issue 4: Job Configuration Issues**
**Symptoms**: Webhook received but job not triggered
**Solution**:
1. **Check Job Name**: Ensure job name matches exactly
2. **Check Branch**: Ensure main branch is configured
3. **Check Polling**: Disable polling if using webhooks
4. **Check SCM**: Ensure Git SCM is properly configured

### **6. Manual Trigger Test**

#### **Test Job Manually:**
1. Go to your Jenkins job
2. Click **Build Now**
3. Check if the build starts successfully
4. Review the build logs for any errors

#### **Test with Sample Payload:**
```bash
# Create a test webhook payload
curl -X POST http://your-jenkins-server/github-webhook/ \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Event: push" \
  -H "X-GitHub-Delivery: test-delivery-id" \
  -d '{
    "ref": "refs/heads/main",
    "repository": {
      "full_name": "BasyirSheersComputer/wastewise-30",
      "name": "wastewise-30",
      "owner": {
        "login": "BasyirSheersComputer"
      }
    },
    "commits": [
      {
        "id": "test-commit-id",
        "message": "Test commit"
      }
    ]
  }'
```

### **7. Alternative Solutions**

#### **Option 1: Use Polling Instead of Webhooks**
1. **Disable Webhook**: Remove webhook from GitHub
2. **Enable Polling**: In Jenkins job configuration
3. **Set Poll Interval**: Every 5 minutes or as needed

#### **Option 2: Use GitHub Actions**
```yaml
# .github/workflows/jenkins-trigger.yml
name: Trigger Jenkins Build
on:
  push:
    branches: [ main ]
jobs:
  trigger-jenkins:
    runs-on: ubuntu-latest
    steps:
    - name: Trigger Jenkins Build
      run: |
        curl -X POST http://your-jenkins-server/job/wastewise-30/build \
          --user username:api-token \
          --data-urlencode json='{"parameter": []}'
```

#### **Option 3: Use Jenkins CLI**
```bash
# Trigger build via Jenkins CLI
java -jar jenkins-cli.jar -s http://your-jenkins-server/ build wastewise-30
```

### **8. Verification Steps**

#### **After Fixing:**
1. **Make a Test Commit**:
   ```bash
   echo "# Test webhook fix" >> README.md
   git add README.md
   git commit -m "Test webhook fix"
   git push origin main
   ```

2. **Check Jenkins**:
   - Go to Jenkins dashboard
   - Look for new build in progress
   - Check build logs

3. **Verify Webhook Delivery**:
   - Go to GitHub webhook settings
   - Check recent deliveries
   - Ensure 200 status codes

### **9. Debugging Commands**

#### **Check Jenkins Status:**
```bash
# Check if Jenkins is running
sudo systemctl status jenkins

# Check Jenkins logs
sudo tail -f /var/log/jenkins/jenkins.log

# Check Jenkins port
netstat -tulpn | grep 8080
```

#### **Check Webhook Endpoint:**
```bash
# Test webhook endpoint
curl -I http://your-jenkins-server/github-webhook/

# Test with verbose output
curl -v -X POST http://your-jenkins-server/github-webhook/ \
  -H "Content-Type: application/json" \
  -d '{"test":"payload"}'
```

#### **Check Network Connectivity:**
```bash
# Test from GitHub to Jenkins
curl -I http://your-jenkins-server/

# Check if port is open
telnet your-jenkins-server 8080
```

## 🎯 **Quick Fix Checklist**

### **✅ Immediate Actions:**
1. **Check GitHub Webhook URL** - Ensure it points to correct Jenkins server
2. **Verify Jenkins Job Configuration** - Ensure webhook trigger is enabled
3. **Check Jenkins Logs** - Look for webhook processing errors
4. **Test Manual Build** - Ensure job can be triggered manually
5. **Verify Network Access** - Ensure GitHub can reach Jenkins server

### **✅ Configuration Checklist:**
- [ ] GitHub webhook URL is correct
- [ ] Webhook events include "Push"
- [ ] Jenkins job has webhook trigger enabled
- [ ] Jenkins has GitHub credentials configured
- [ ] Job name matches repository name
- [ ] Branch configuration includes main
- [ ] Jenkins is accessible from internet

## 🚀 **Next Steps**

1. **Follow the troubleshooting steps above**
2. **Check each component systematically**
3. **Test with manual triggers first**
4. **Verify webhook delivery in GitHub**
5. **Monitor Jenkins logs during push**

**🔧 Once the webhook is working, your CI/CD pipeline will automatically build and deploy your WasteWise-30 application!** 