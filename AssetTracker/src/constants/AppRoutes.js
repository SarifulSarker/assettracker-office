// src/constants/AppRoutes.js
import Home from '../Pages/Home';
import SignIn from '../Pages/Auth/SignIn';
import Signup from '../Pages/Auth/Signup';
import Dashboard from '../Pages/Dashboard';

      import * as urls from "./AppUrls"
import Assets from '../Pages/Asset/Assets';

import user from '../Pages/User/user';
import userCreate from '../Pages/User/userCreate';
import userEdit from '../Pages/User/userEdit';
import ForgetPassword from '../Pages/Auth/ForgotPassword';
import department from '../Pages/Department/department';

import Category from '../Pages/Category/Category';
import Brand from '../Pages/Brand/Brand';
import Vendor from '../Pages/Vendor/vendor'
import employee from '../Pages/Emplpoyee/employee';
import designation from '../Pages/Designation/designation';
import assetCreate from '../Pages/Asset/assetCreate';
import assetEdit from '../Pages/Asset/assetEdit';
import assetMapping from '../Pages/AssetMapping/assetMapping';
import assetLog from '../Pages/Asset/assetLog';

const appRoutes = [
    {
        path: urls.HOME,
        Element: Home,
        isIndexUrl: true,
        isProtected: false
    },

    {
        path: urls.SIGNIN,
        Element: SignIn,
        isIndexUrl: false,
        isProtected: false

    },
    {
        path: urls.SIGNUP,
        Element: Signup,
        isIndexUrl: false,
        isProtected: false
    },
    {
        path: urls.DASHBOARD,
        Element: Dashboard,
        isIndexUrl: false,
        isProtected: true
    },
    //assets
    {
        path:urls.ASSETS,
        Element:Assets,
        isIndexUrl:true,
        isProtected:true
    },
    {
        path:urls.ASSET_CREATE,
        Element:assetCreate,
        isIndexUrl:false,
        isProtected:true
    },

     {
        path:urls.ASSET_EDIT,
        Element:assetEdit,
        isIndexUrl:false,
        isProtected:true
    },
     {
        path:urls.ASSET_MAPPING,
        Element:assetMapping,
        isIndexUrl:false,
        isProtected:true
    },
     {
        path:urls.ASSET_LOG,
        Element:assetLog,
        isIndexUrl:false,
        isProtected:true
    },
      
   //user
     {
        path:urls.USER,
        Element:user,
        isIndexUrl:false,
        isProtected:true
    },
     {
        path:urls.USER_CREATE,
        Element:userCreate,
        isIndexUrl:false,
        isProtected:true
    },

    {
        path:urls.USER_EDIT,
        Element:userEdit,
        isIndexUrl:false,
        isProtected:true
    },

     {
        path:urls.ForgetPassword,
        Element:ForgetPassword,
        isIndexUrl:false,
        isProtected:false
    },

    // department

     {
        path:urls.DEPARTMENT,
        Element:department,
        isIndexUrl:false,
        isProtected:true
    },

   
   
// categories
    {
         path:urls.CATEGORIES,
        Element:Category,
        isIndexUrl:false,
        isProtected:true
    },

    //Brand
    {
         path:urls.BRAND,
        Element:Brand,
        isIndexUrl:false,
        isProtected:true
    },
     {
         path:urls.VENDOR,
        Element:Vendor,
        isIndexUrl:false,
        isProtected:true
    },
     {
         path:urls.EMPLOYEE,
        Element:employee,
        isIndexUrl:false,
        isProtected:true
    },

    {
        path:urls.DESIGNATION,
        Element:designation,
        isIndexUrl:false,
        isProtected:true
    }
  
];

export default appRoutes;
