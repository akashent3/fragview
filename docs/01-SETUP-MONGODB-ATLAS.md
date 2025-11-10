# Setup MongoDB Atlas for FragView

## Step 1: Create Account
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Click "Sign up" (use your email)
3. Fill form: Name, Email, Password
4. Click "Create your Atlas account"

## Step 2: Create Free Cluster
1. After login, click "Build a Database"
2. Select "M0 Free" (leftmost option)
3. Choose cloud provider: **AWS**
4. Choose region: **Mumbai (ap-south-1)** (closest to India)
5. Cluster Name: `fragview-cluster`
6. Click "Create"
   - Wait 3-5 minutes for cluster creation

## Step 3: Create Database User
1. Click "Database Access" (left sidebar)
2. Click "+ ADD NEW DATABASE USER"
3. Authentication Method: **Password**
4. Username: `fragview_admin`
5. Password: Click "Autogenerate Secure Password" (SAVE THIS!)
6. Database User Privileges: Select "Atlas admin"
7. Click "Add User"

## Step 4: Setup Network Access
1. Click "Network Access" (left sidebar)
2. Click "+ ADD IP ADDRESS"
3. Click "ALLOW ACCESS FROM ANYWHERE"
4. This adds `0.0.0.0/0` (needed for Vercel deployment)
5. Click "Confirm"

## Step 5: Get Connection String
1. Click "Database" (left sidebar)
2. Click "Connect" on your cluster
3. Select "Connect your application"
4. Driver: **Node.js**, Version: **5.5 or later**
5. Copy the connection string (looks like):
   ```
   mongodb+srv://fragview_admin:<password>@fragview-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<password>` with the password from Step 3

## Step 6: Create Databases
1. Click "Browse Collections"
2. Click "+ Create Database"
3. Database Name: `fragview`
4. Collection Name: `brands`
5. Click "Create"

## SAVE THESE:
- Connection String: mongodb+srv://fragview_admin:YOUR_PASSWORD@fragview-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
- Password: [your generated password]

✅ MongoDB Atlas is ready!