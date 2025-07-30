# 🚀 Webhook Quick Fix Guide

## ✅ **Diagnostic Results**

The diagnostic shows:
- ✅ **Git Configuration**: Correct GitHub repository and main branch
- ✅ **Jenkins Accessibility**: Server and webhook endpoint are accessible
- ✅ **Recent Commits**: Commits are being pushed successfully

## 🎯 **The Issue**

The problem is likely in the **GitHub webhook configuration**. Here's how to fix it:

## 🔧 **Step-by-Step Fix**

### **1. Check GitHub Webhook Settings**

Go to: `https://github.com/BasyirSheersComputer/wastewise-30/settings/hooks`

#### **Verify Webhook URL:**
- **Current URL**: Check what's currently configured
- **Correct URL**: `http://192.168.20.215:8080/github-webhook/`
- **Update if needed**: Change to the correct URL

#### **Verify Webhook Events:**
- ✅ **Push** (must be enabled)
- ✅ **Pull Request** (optional)
- ✅ **Repository** (optional)

### **2. Check Jenkins Job Configuration**

Go to: `http://192.168.20.215:8080/job/wastewise-30/configure`

#### **Verify Job Settings:**
- **Source Code Management**: Git
- **Repository URL**: `https://github.com/BasyirSheersComputer/wastewise-30.git`
- **Branches**: `*/main` or `main`
- **Build Triggers**: ✅ "GitHub hook trigger for GITScm polling"

### **3. Test Webhook Manually**

#### **Test from GitHub:**
1. Go to webhook settings
2. Click on your webhook
3. Scroll to "Recent Deliveries"
4. Click "Redeliver" on the latest delivery
5. Check response (should be 200 OK)

#### **Test from Command Line:**
```bash
# Test webhook endpoint
curl -X POST http://192.168.20.215:8080/github-webhook/ \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Event: push" \
  -d '{"ref":"refs/heads/main","repository":{"full_name":"BasyirSheersComputer/wastewise-30"}}'
```

### **4. Test Manual Build**

```bash
# Trigger build manually
curl -X POST http://192.168.20.215:8080/job/wastewise-30/build
```

## 🚨 **Common Issues and Solutions**

### **Issue 1: Webhook URL Wrong**
**Symptoms**: 404 errors in webhook deliveries
**Fix**: Update webhook URL to `http://192.168.20.215:8080/github-webhook/`

### **Issue 2: Job Name Mismatch**
**Symptoms**: Webhook received but no build triggered
**Fix**: Ensure Jenkins job is named exactly `wastewise-30`

### **Issue 3: Branch Configuration**
**Symptoms**: Webhook works but builds don't trigger
**Fix**: Ensure branch specifier includes `main` or `*/main`

### **Issue 4: Build Triggers Disabled**
**Symptoms**: Job exists but webhook doesn't trigger builds
**Fix**: Enable "GitHub hook trigger for GITScm polling"

## 🧪 **Test Commands**

### **Test Jenkins Accessibility:**
```bash
curl -I http://192.168.20.215:8080
```

### **Test Webhook Endpoint:**
```bash
curl -X POST http://192.168.20.215:8080/github-webhook/ \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Event: push" \
  -d '{"ref":"refs/heads/main","repository":{"full_name":"BasyirSheersComputer/wastewise-30"}}'
```

### **Test Manual Build:**
```bash
curl -X POST http://192.168.20.215:8080/job/wastewise-30/build
```

### **Check Jenkins Logs:**
```bash
sudo tail -f /var/log/jenkins/jenkins.log
```

## 📋 **Verification Checklist**

### **GitHub Webhook Settings:**
- [ ] Webhook URL: `http://192.168.20.215:8080/github-webhook/`
- [ ] Content type: `application/json`
- [ ] Events: Push, Pull Request, Repository
- [ ] Active: ✅ Enabled

### **Jenkins Job Configuration:**
- [ ] Job name: `wastewise-30`
- [ ] Source Code Management: Git
- [ ] Repository URL: `https://github.com/BasyirSheersComputer/wastewise-30.git`
- [ ] Branches: `*/main`
- [ ] Build Triggers: GitHub hook trigger enabled

### **Test Results:**
- [ ] Manual build works
- [ ] Webhook endpoint responds
- [ ] GitHub webhook delivery successful
- [ ] Build triggers on push

## 🎯 **Quick Test**

After making changes:

1. **Make a test commit:**
   ```bash
   echo "# Test webhook fix" >> README.md
   git add README.md
   git commit -m "Test webhook fix"
   git push origin main
   ```

2. **Check Jenkins:**
   - Go to `http://192.168.20.215:8080/job/wastewise-30/`
   - Look for new build in progress

3. **Check GitHub:**
   - Go to webhook settings
   - Check recent deliveries
   - Verify 200 status codes

## 🚀 **Expected Result**

Once fixed, you should see:
- ✅ Webhook deliveries with 200 status
- ✅ Jenkins builds triggered automatically
- ✅ Docker image built and deployed
- ✅ Application deployed to `http://sheerstechnologies.com/wastewise-30/`

## 📞 **If Still Not Working**

1. **Check Jenkins logs** for specific errors
2. **Verify network connectivity** between GitHub and Jenkins
3. **Test with polling** instead of webhooks temporarily
4. **Contact system administrator** if Jenkins server issues

**🎉 Once the webhook is working, your CI/CD pipeline will automatically build and deploy your WasteWise-30 application!** 