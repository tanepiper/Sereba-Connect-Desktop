var Serebra;if(!Serebra){Serebra=function(){}}Serebra.Chrome=function(){};Serebra.Database=function(){};
Serebra.Menu=function(){};Serebra.Messages=function(){};Serebra.Network=function(){};
Serebra.SOAP=function(){};Serebra.System=function(){};Serebra.Update=function(){};
Serebra.Initialize=function(){Serebra.ApplicationName="";Serebra.ApplicationCode="";
Serebra.AuthCode=null;Serebra.AutoLogin=false;Serebra.AutoStart=false;Serebra.DatabaseFileName="";
Serebra.DebugMode=false;Serebra.DisplayPopups=true;Serebra.Errors=[];Serebra.FirstRun=false;
Serebra.ForceUpdate=false;Serebra.ForceOffline=false;Serebra.LoggedIn=false;Serebra.MessageCheckTime=300000;
Serebra.NetworkOnline=false;Serebra.Password="";Serebra.PlayPopupSound=true;Serebra.RememberMe=false;
Serebra.UnreadMessages=false;Serebra.Username="";try{air.File.applicationStorageDirectory.resolvePath("update").deleteDirectory(true)
}catch(A){}air.NativeApplication.nativeApplication.addEventListener(air.InvokeEvent.INVOKE,Serebra._InvokeApplication)
};Serebra._InvokeApplication=function(A){Serebra.System.InvokeSettings(A.arguments,A.currentDirectory,function(){Serebra.Database.ConnectToFile({databaseFile:Serebra.DatabaseFileName,createFile:true});
Serebra.System.LoadDatabaseSettings(function(){Serebra.Menu.Initialize();if(Serebra.FirstRun){Serebra.Database.SetupFirstRun(function(){Serebra.Chrome.LoginWindow(function(){Serebra.Network.CheckLogin()
})})}else{if(Serebra.AutoLogin){Serebra.Network.CheckLogin()}else{Serebra.Chrome.LoginWindow(function(){Serebra.Network.CheckLogin()
})}}})})};Serebra.Database.DatabaseFile=null;Serebra.Database.ConnectToFile=function(A){function B(){return{airDir:"applicationStorageDirectory",databaseFile:"",createFile:true}
}A=jQuery.extend(B(),A);var C=air.File[A.airDir];C=C.resolvePath(A.databaseFile);
if(!C.exists){if(A.createFile){Serebra.Database.CreateDB(C)}else{C=null}}Serebra.Database.DatabaseFile=C
};Serebra.Database.CreateDB=function(){Serebra.FirstRun=true;var A=new air.SQLConnection();
A.addEventListener(air.SQLErrorEvent.ERROR,Serebra.Database.ErrorHandler);A.open(Serebra.Database.DatabaseFile,air.SQLMode.CREATE);
A.close();return true};Serebra.Database.ErrorHandler=function(A){air.trace(A.target)
};Serebra.Database.Query=function(E){function G(){return{queryString:""}}E=jQuery.extend(G(),E);
var B=false;var A=false;try{var C=new air.SQLConnection();C.open(Serebra.Database.DatabaseFile,air.SQLMode.CREATE);
var F=new air.SQLStatement();F.addEventListener(air.SQLErrorEvent.ERROR,Serebra.Database.ErrorHandler);
F.sqlConnection=C;F.text=E.queryString;F.execute();var H=F.getResult();if(H){B=true;
A=H}C.close()}catch(D){B=false;A=D}return{success:B,result:A}};Serebra.Database.SaveOrCreateOption=function(B){function D(){return{key:"",value:"",overwrite:true}
}B=jQuery.extend(D(),B);var C=false;var A;var E=Serebra.Database.Query({queryString:'SELECT * FROM serebra_options WHERE key = "'+B.key+'"'});
if(E.result.data){A=null;if(B.overwrite){A=Serebra.Database.Query({queryString:'UPDATE serebra_options SET value = "'+B.value+'" WHERE key = "'+B.key+'"'})
}C=true}else{C=false;A=Serebra.Database.Query({queryString:'INSERT INTO serebra_options (key, value) VALUES("'+B.key+'", "'+B.value+'")'})
}return{exists:C,result:A}};Serebra.Database.SetupFirstRun=function(A){Serebra.Database.Query({queryString:"CREATE TABLE IF NOT EXISTS serebra_options (key TEXT, value TEXT);"});
Serebra.Database.Query({queryString:"CREATE TABLE IF NOT EXISTS serebra_user_alerts (AlertID INTEGER PRIMARY KEY, Type TEXT, alertText TEXT, userLink TEXT, objectLink TEXT, messageRead INTEGER);"});
if(typeof A==="function"){return A()}};Serebra.Menu.CreateLoginMenu=function(){air.NativeApplication.nativeApplication.icon.menu=new air.NativeMenu();
air.NativeApplication.nativeApplication.icon.addEventListener("click",Serebra.Menu.SystrayClickHandler);
var A={serebraConnect:new air.NativeMenuItem("Open Serebra Connect",false),loginMenu:new air.NativeMenuItem("Login",false),closeMenu:new air.NativeMenuItem("Exit",false)};
jQuery.each(A,function(B,C){air.NativeApplication.nativeApplication.icon.menu.addItem(C);
C.addEventListener(air.Event.SELECT,Serebra.Menu.MenuItemClickHandler)})};Serebra.Menu.CreateSystrayMenu=function(){air.NativeApplication.nativeApplication.icon.menu=new air.NativeMenu();
air.NativeApplication.nativeApplication.icon.addEventListener("click",Serebra.Menu.SystrayClickHandler);
var A={serebraConnect:new air.NativeMenuItem("Open Serebra Connect",false),messageCenter:new air.NativeMenuItem("Open Alerts Center",false),updatesMenu:new air.NativeMenuItem("Check For Updates",false),optionsMenu:new air.NativeMenuItem("Settings",false),logoutMenu:new air.NativeMenuItem("Logout",false),closeMenu:new air.NativeMenuItem("Exit",false)};
if(Serebra.DebugMode){A=jQuery.extend({fakeAlerts:new air.NativeMenuItem("Create Fake Alert",false)},A)
}jQuery.each(A,function(B,C){air.NativeApplication.nativeApplication.icon.menu.addItem(C);
C.addEventListener(air.Event.SELECT,Serebra.Menu.MenuItemClickHandler)})};Serebra.Menu.Initialize=function(){function A(C){if(air.NativeApplication.supportsSystemTrayIcon){air.NativeApplication.nativeApplication.icon.bitmaps=new Array(C.target.content.bitmapData);
Serebra.Menu.CreateLoginMenu()}}var B=new runtime.flash.display.Loader();B.contentLoaderInfo.addEventListener(air.Event.COMPLETE,A);
B.load(new air.URLRequest("app:/assets/images/icon_tray_natural.png"))};Serebra.Menu.MenuItemClickHandler=function(A){switch(A.target.label){case"Open Serebra Connect":air.navigateToURL(new air.URLRequest("http://www.serebraconnect.com/"));
break;case"Open Alerts Center":Serebra.Chrome.MessageCenter();break;case"Settings":Serebra.Chrome.Settings();
break;case"Create Fake Alert":Serebra.SOAP.CreateFakeAlert(null,function(){});break;
case"Check For Updates":Serebra.Update.InvokeApplicationUpdate({updateXML:"http://dev.ifies.org/descriptor/update.xml",displayFail:true});
break;case"Login":Serebra.Chrome.LoginWindow(function(){Serebra.Network.CheckLogin()
});break;case"Logout":Serebra.Network.Logout();break;case"Exit":air.NativeApplication.nativeApplication.exit();
break;default:break}return};Serebra.Menu.SystrayClickHandler=function(A){if(Serebra.NetworkOnline){Serebra.Chrome.MessageCenter()
}else{Serebra.Chrome.LoginWindow(function(){Serebra.Network.CheckLogin()})}};Serebra.Messages.DeleteMessage=function(E,D){var A=false;
var C=Serebra.Database.Query({queryString:"SELECT * FROM serebra_user_alerts WHERE AlertID = "+E});
if(C.result.data){if(!C.result.data[0].messageRead){Serebra.SOAP.ConsumeAlert({authCode:Serebra.AuthCode,applicationCode:Serebra.ApplicationCode,alertID:E},function(F){var I=jQuery("errorFlag",F).text();
var H=jQuery("errorString",F).text();var G;if(I=="false"){G=Serebra.Database.Query({queryString:"DELETE FROM serebra_user_alerts WHERE AlertID = "+E});
if(G.success){A=true}}else{if(H=="you don't own that alert"){G=Serebra.Database.Query({queryString:"DELETE FROM serebra_user_alerts WHERE AlertID = "+E});
if(G.success){A=true}}}return D(A)})}else{var B=Serebra.Database.Query({queryString:"DELETE FROM serebra_user_alerts WHERE AlertID = "+E});
if(B.result.complete){A=true}}}return D(A)};Serebra.Network.CheckConnectivity=function(A){air.trace("Network gone offline")
};Serebra.Network.CheckURL=function(A){if(Serebra.Network.Monitor.available){Serebra.Network.Online()
}else{Serebra.Network.Logout()}};Serebra.Network.CheckLogin=function(A){Serebra.SOAP.Authenticate({username:Serebra.Username,password:Serebra.Password,applicationCode:Serebra.ApplicationCode},function(B){var D=jQuery("errorFlag",B).text();
if(D=="false"){Serebra.LoggedIn=true;Serebra.AuthCode=jQuery("authCode",B).text();
Serebra.Menu.CreateSystrayMenu();Serebra.Network.Initialize(Serebra.MessageCheckTime);
Serebra.Chrome.MessageCenter()}else{var C=jQuery("errorString",B).text();if(C===""){C="Unknown Error"
}Serebra.Errors.push("Login Error: "+C);Serebra.Chrome.LoginWindow(function(E){Serebra.Network.CheckLogin(E)
})}})};Serebra.Network.CheckMessages=function(){Serebra.SOAP.GetUserAlerts({authCode:Serebra.AuthCode,applicationCode:Serebra.ApplicationCode},function(A){var B=0;
jQuery("alert",A).each(function(){B=B+1;var J=jQuery(this).attr("id");var F=jQuery("type",this).text();
var I=jQuery("alertText",this).text();var H=jQuery("userLink",this).text();var E=jQuery("objectLink",this).text();
var G=Serebra.Database.Query({queryString:"SELECT * FROM serebra_user_alerts WHERE AlertID = "+J});
if(!G.result.data){Serebra.Database.Query({queryString:"INSERT INTO serebra_user_alerts VALUES("+J+',"'+F+'","'+I+'","'+H+'","'+E+'",0)'});
Serebra.UnreadMessages=true}else{if(G.result.data[0].messageRead===0){Serebra.UnreadMessages=true
}}});if(Serebra.UnreadMessages){function C(E){if(air.NativeApplication.supportsSystemTrayIcon){air.NativeApplication.nativeApplication.icon.bitmaps=new Array(E.target.content.bitmapData);
air.NativeApplication.nativeApplication.icon.tooltip="Serebra Connect Alerts - You have unread messages"
}if(Serebra.DisplayPop==="true"){Serebra.Chrome.MessagePopup({messageCount:B})}}var D=new runtime.flash.display.Loader();
D.contentLoaderInfo.addEventListener(air.Event.COMPLETE,C);D.load(new air.URLRequest("app:/assets/images/icon_tray_newalerts.png"))
}})};Serebra.Network.Monitor=null;Serebra.Network.MessageCheckTimer=null;Serebra.Network.Initialize=function(B){air.NativeApplication.nativeApplication.addEventListener(air.Event.NETWORK_CHANGE,Serebra.Network.CheckConnectivity);
var A=new air.URLRequest("http://qa.serebracampus.com:8888/apiWebService.cfc?wsdl");
Serebra.Network.Monitor=new air.URLMonitor(A);Serebra.Network.Monitor.addEventListener(air.StatusEvent.STATUS,Serebra.Network.CheckURL);
Serebra.Network.Monitor.start()};Serebra.Network.Logout=function(){Serebra.NetworkOnline=false;
function A(C){if(air.NativeApplication.supportsSystemTrayIcon){air.NativeApplication.nativeApplication.icon.bitmaps=new Array(C.target.content.bitmapData);
air.NativeApplication.nativeApplication.icon.tooltip="Serebra Connect Alerts Is Offline";
jQuery(air.NativeApplication.nativeApplication.openedWindows).each(function(D,E){if(E.title!=="Serebra Connect Alerts"){E.close()
}});Serebra.Network.MessageCheckTimer.stop();Serebra.Menu.CreateLoginMenu()}}var B=new runtime.flash.display.Loader();
B.contentLoaderInfo.addEventListener(air.Event.COMPLETE,A);B.load(new air.URLRequest("app:/assets/images/icon_tray_natural.png"))
};Serebra.Network.Online=function(){Serebra.NetworkOnline=true;function A(C){if(air.NativeApplication.supportsSystemTrayIcon){air.NativeApplication.nativeApplication.icon.bitmaps=new Array(C.target.content.bitmapData);
air.NativeApplication.nativeApplication.icon.tooltip="Serebra Connect Alerts Is Online";
Serebra.Update.InvokeApplicationUpdate({updateXML:"http://dev.ifies.org/descriptor/update.xml",displayFail:false});
Serebra.Network.CheckMessages();Serebra.Network.MessageCheckTimer=new air.Timer(Serebra.MessageCheckTime,0);
Serebra.Network.MessageCheckTimer.addEventListener(air.TimerEvent.TIMER,Serebra.Network.CheckMessages);
Serebra.Network.MessageCheckTimer.start();return}}var B=new runtime.flash.display.Loader();
B.contentLoaderInfo.addEventListener(air.Event.COMPLETE,A);B.load(new air.URLRequest("app:/assets/images/icon_desktop_16.png"));
return};Serebra.SOAP.Authenticate=function(B,C){var A=[];A.push('<?xml version="1.0" encoding="UTF-8"?>\n\n');
A.push('<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">');
A.push("<soapenv:Body>");A.push('<authenticate xmlns="http://DefaultNamespace">');
A.push("<username>"+B.username+"</username>");A.push("<password>"+B.password+"</password>");
A.push("<applicationCode>"+B.applicationCode+"</applicationCode>");A.push("</authenticate>");
A.push("</soapenv:Body>");A.push("</soapenv:Envelope>");Serebra.SOAP.GetResponse(A.join(""),C)
};Serebra.SOAP.ConsumeAlert=function(B,C){var A=[];A.push('<?xml version="1.0" encoding="UTF-8"?>\n\n');
A.push('<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">');
A.push("<soapenv:Body>");A.push('<consumeAlert xmlns="http://DefaultNamespace">');
A.push("<authCode>"+B.authCode+"</authCode>");A.push("<applicationCode>"+B.applicationCode+"</applicationCode>");
A.push("<alertID>"+B.alertID+"</alertID>");A.push("</consumeAlert>");A.push("</soapenv:Body>");
A.push("</soapenv:Envelope>");Serebra.SOAP.GetResponse(A.join(""),C)};Serebra.SOAP.CreateFakeAlert=function(B,C){var A=[];
A.push('<?xml version="1.0" encoding="UTF-8"?>\n\n');A.push('<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">');
A.push("<soapenv:Body>");A.push('<fakeAlert xmlns="http://DefaultNamespace">');A.push("<taskID>100786</taskID>");
A.push("<userID>100037</userID>");A.push("<alertTypeID>6</alertTypeID>");A.push("<msgSenderUserID>0</msgSenderUserID>");
A.push("<questionUserID>100037</questionUserID>");A.push("<bidID>0</bidID>");A.push("</fakeAlert>");
A.push("</soapenv:Body>");A.push("</soapenv:Envelope>");Serebra.SOAP.GetResponse(A.join(""),C)
};Serebra.SOAP.GetResponse=function(A,B){jQuery.ajax({type:"POST",url:"http://qa.serebracampus.com:8888/apiWebService.cfc?wsdl",contentType:"text/xml",data:A,dataType:"xml",processData:false,beforeSend:function(C){C.setRequestHeader("SOAPAction","http://qa.serebracampus.com:8888/apiWebService.cfc?wsdl")
},success:function(C){return B(C)},error:function(C,E,D){return B()}})};Serebra.SOAP.GetUserAlerts=function(B,C){var A=[];
A.push('<?xml version="1.0" encoding="UTF-8"?>\n\n');A.push('<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">');
A.push("<soapenv:Body>");A.push('<getUserAlerts xmlns="http://DefaultNamespace">');
A.push("<authCode>"+B.authCode+"</authCode>");A.push("<applicationCode>"+B.applicationCode+"</applicationCode>");
A.push("</getUserAlerts>");A.push("</soapenv:Body>");A.push("</soapenv:Envelope>");
Serebra.SOAP.GetResponse(A.join(""),C)};Serebra.System.InvokeSettings=function(A,C,E){var D=new air.FileStream();
var B=air.File.applicationDirectory.resolvePath("settings.xml");jQuery.each(A,function(F,G){switch(G){case"debug-mode":Serebra.DebugMode=true;
break;case"force-update":Serebra.ForceUpdate=true;break;case"force-offline":Serebra.ForceOffline=true;
break;default:break}});jQuery.get(B.url,null,function(F,G){Serebra.ApplicationName=jQuery("appname",F).text();
Serebra.ApplicationCode=jQuery("appcode",F).text();Serebra.DatabaseFileName=jQuery("database",F).text();
if(typeof E==="function"){return E()}else{throw new Error("You must return a callback with this function")
}},"xml")};Serebra.System.LoadDatabaseSettings=function(B){var A=Serebra.Database.Query({queryString:"SELECT * FROM serebra_options"});
if(A.result.data){jQuery.each(A.result.data,function(C,D){switch(D.key){case"autologin":Serebra.AutoLogin=D.value;
break;case"autostart":Serebra.AutoStart=D.value;break;case"checktime":Serebra.MessageCheckTime=parseInt(D.value,10);
break;case"password":Serebra.Password=D.value;break;case"rememberme":Serebra.RememberMe=D.value;
break;case"username":Serebra.Username=D.value;break;case"displaypopups":Serebra.DisplayPop=D.value;
break;case"popupsound":Serebra.PlayPopupSound=D.value;break;default:break}})}if(typeof B==="function"){return B()
}else{throw new Error("You must return a callback with this function")}};Serebra.Update.AppVersionCheck=function(A){var C=jQuery(A.target.data).find("version").text();
var B=C.split(".");var I=jQuery(A.target.data).find("url").text();var J=air.NativeApplication.nativeApplication.applicationDescriptor;
var E=new DOMParser();var H=E.parseFromString(J,"text/xml");var K=H.getElementsByTagName("application")[0];
var D=K.getElementsByTagName("version")[0].firstChild.data;D=D.split(".");var F=false;
var M=new air.URLStream();jQuery.each(B,function(O,P){if(P>D[O]){F=true}});if(F){var L=confirm("We have found an update for Serebra Connect Alerts.  Would you like to download now?");
if(L){M.addEventListener(air.ProgressEvent.PROGRESS,N);M.addEventListener(air.Event.COMPLETE,G);
M.load(new air.URLRequest(I))}}else{if(Serebra.Update.ShowFail){alert("No updates have been found at this time.");
Serebra.Update.ShowFail=false}}function N(P){var O=Math.round((P.bytesLoaded/P.bytesTotal)*100)
}function G(P){var O="update/SRDesktop-"+C+".air";var R=new air.ByteArray();M.readBytes(R,0,M.bytesAvailable);
updateFile=air.File.applicationStorageDirectory.resolvePath(O);fileStream=new air.FileStream();
fileStream.addEventListener(air.Event.CLOSE,Q);fileStream.openAsync(updateFile,air.FileMode.WRITE);
fileStream.writeBytes(R,0,R.length);fileStream.close();function Q(S){var T=new air.Updater();
T.update(updateFile,C)}}};Serebra.Update.ShowFail=false;Serebra.Update.InvokeApplicationUpdate=function(B){function D(){return{updateXML:""}
}B=jQuery.extend(D(),B);var C=new air.URLRequest(B.updateXML);var A=new air.URLLoader();
Serebra.Update.ShowFail=B.displayFail;A.addEventListener(air.Event.COMPLETE,Serebra.Update.AppVersionCheck);
A.load(C)};Serebra.Chrome.ConfirmPrompt=function(C,F){this.windowLoaded=function(H){var G=H.target.window;
if(G.nativeWindow&&G.document){var J=air.Screen.mainScreen.bounds.width/2;var I=air.Screen.mainScreen.bounds.height/2;
G.nativeWindow.x=J-(G.nativeWindow.width/2);G.nativeWindow.y=I-(G.nativeWindow.height/2);
var K=jQuery("#confirm-message",G.document).get(0);G.nativeWindow.height=jQuery("#confirm-message",G.document).height()+100;
jQuery("#window-handle",K).bind("mousedown.move",function(){G.nativeWindow.startMove()
});jQuery(".close-button",K).click(function(){G.close();return false});jQuery(".message",K).html("<h2>"+C+"</h2>");
jQuery(".confirm-button",K).click(function(){var M=jQuery(this).val();var L;if(M==="Yes"){G.close();
return F()}G.close();return false})}};var E=new air.NativeWindowInitOptions();E.systemChrome=air.NativeWindowSystemChrome.NONE;
E.transparent=true;E.type=air.NativeWindowType.LIGHTWEIGHT;var B=new air.Rectangle(0,0,255,155);
var A=air.HTMLLoader.createRootWindow(true,E,false,B);A.paintsDefaultBackground=false;
A.stage.nativeWindow.alwaysInFront=true;A.navigateInSystemBrowser=true;A.addEventListener(air.Event.COMPLETE,this.windowLoaded);
var D=false;jQuery(air.NativeApplication.nativeApplication.openedWindows).each(function(G,H){if(H.title==="Serebra Connect Alerts - Confirm"){D=true
}});if(!D){A.load(new air.URLRequest("app:/assets/html/ConfirmPrompt.html"))}};Serebra.Chrome.LoginWindow=function(E){this.windowLoaded=function(I){var G=I.target.window.nativeWindow;
var H=I.target.window.document;if(G&&H){var K=air.Screen.mainScreen.bounds.width/2;
var J=air.Screen.mainScreen.bounds.height/2;G.x=K-(G.width/2);G.y=J-(G.height/2);
var F=jQuery("#login-area",H).get(0);jQuery("#autologin",F).attr("checked",Serebra.AutoLogin);
jQuery("#password",F).val(Serebra.Password);jQuery("#rememberme",F).attr("checked",Serebra.RememberMe);
jQuery("#username",F).val(Serebra.Username);jQuery("#window-handle",F).bind("mousedown.move",function(){G.startMove()
});jQuery(".close-button, #cancel",F).click(function(){G.close();return false});jQuery("#login",F).click(function(){Serebra.AutoLogin=jQuery("#autologin",F).attr("checked");
Serebra.Password=jQuery("#password",F).val();Serebra.RememberMe=jQuery("#rememberme",F).attr("checked");
Serebra.Username=jQuery("#username",F).val();if(Serebra.RememberMe===true){Serebra.Database.SaveOrCreateOption({key:"autologin",value:Serebra.AutoLogin});
Serebra.Database.SaveOrCreateOption({key:"password",value:Serebra.Password});Serebra.Database.SaveOrCreateOption({key:"rememberme",value:Serebra.RememberMe});
Serebra.Database.SaveOrCreateOption({key:"username",value:Serebra.Username})}else{Serebra.Database.SaveOrCreateOption({key:"username",value:""});
Serebra.Database.SaveOrCreateOption({key:"password",value:""});Serebra.Database.SaveOrCreateOption({key:"autologin",value:""});
Serebra.Database.SaveOrCreateOption({key:"rememberme",value:""})}G.close();return E()
});jQuery("#create-account",F).click(function(){var M=jQuery(this).attr("href");air.navigateToURL(new air.URLRequest(M));
return false});if(Serebra.Errors.length>0){var L=[];jQuery.each(Serebra.Errors,function(N,M){L.push("<li>"+M+"</li>")
});Serebra.Errors=[];jQuery("#form-errors ul",F).append(L.join(""));jQuery("#form-errors",F).fadeIn()
}}};var D=new air.NativeWindowInitOptions();D.systemChrome=air.NativeWindowSystemChrome.NONE;
D.transparent=true;D.type=air.NativeWindowType.NORMAL;var B=new air.Rectangle(0,0,318,285);
var A=air.HTMLLoader.createRootWindow(true,D,false,B);A.paintsDefaultBackground=false;
A.stage.nativeWindow.alwaysInFront=true;A.navigateInSystemBrowser=true;A.addEventListener(air.Event.COMPLETE,this.windowLoaded);
var C=false;jQuery(air.NativeApplication.nativeApplication.openedWindows).each(function(F,G){if(G.title==="Serebra Connect Alerts - Log In"){C=true
}});if(!C){A.load(new air.URLRequest("app:/assets/html/LoginWindow.html"))}};Serebra.Chrome.MessageCenter=function(){var D=false;
jQuery(air.NativeApplication.nativeApplication.openedWindows).each(function(F,G){if(G.title==="Serebra Connect Alerts - Alert Center"){D=true;
G.visible=true;G.activate();G.orderToFront()}});if(!D){var E=new air.NativeWindowInitOptions();
E.systemChrome=air.NativeWindowSystemChrome.NONE;E.transparent=true;E.type=air.NativeWindowType.NORMAL;
var C=new air.Rectangle(0,0,640,385);var A=air.HTMLLoader.createRootWindow(false,E,false,C);
A.paintsDefaultBackground=false;A.stage.nativeWindow.alwaysInFront=false;A.navigateInSystemBrowser=true;
A.addEventListener(air.Event.COMPLETE,B);A.load(new air.URLRequest("app:/assets/html/MessageCenter.html"))
}function B(H){var F=H.target.window.nativeWindow;var G=H.target.window.document;
if(F&&G){F.addEventListener(air.Event.ACTIVATE,I);var K=air.Screen.mainScreen.bounds.width/2;
var J=air.Screen.mainScreen.bounds.height/2;F.x=K-(F.width/2);F.y=J-(F.height/2);
var M=jQuery("#message-center",G).get(0);function L(P){function O(){jQuery("tr#"+P,M).fadeOut(function(){jQuery(this).remove();
I()})}jQuery("tr#"+P,M).css({"background-color":"#f00"});var N=new air.Timer(1000,1);
N.addEventListener(air.TimerEvent.TIMER,O);N.start()}jQuery("#window-handle",M).bind("mousedown.move",function(){F.startMove()
});jQuery(".close-button",M).click(function(){F.visible=false;return false});jQuery(".min-button",M).click(function(){F.minimize();
return false});function I(){jQuery("#inner-table-wrapper",M).remove();var P=Serebra.Database.Query({queryString:"SELECT * FROM serebra_user_alerts ORDER BY AlertID DESC"});
var N=[];N.push('<div id="inner-table-wrapper">');N.push('<table id="message-table" cellspacing="0" cellpadding="0" width="100%">');
N.push("<thead>");N.push("<tr>");N.push("<th>&nbsp;</th>");N.push("<th>Type</th>");
N.push("<th>Details</th>");N.push("<th>&nbsp;</th>");N.push("</tr>");N.push("</thead>");
N.push("<tbody>");if(P.result.data!==null){jQuery.each(P.result.data,function(R,S){N.push('<tr id="'+S.AlertID+'">');
switch(S.messageRead){case 0:N.push('<td width="55"><span class="unread">Unread</span></td>');
break;case 1:N.push('<td width="55"><span class="read">Read</span></td>');break;default:break
}N.push('<td width="55">'+S.Type+"</td>");N.push('<td width="450">'+S.alertText+"</td>");
N.push('<td width="55"><a class="delete" href="#" rel="'+S.AlertID+'"><span>Delete</span<</a></td>');
N.push("</tr>")});N.push("</tbody>");N.push("</table>");N.push("</div>")}else{N.push('<tr width="100%"><td colspan="5" width="100%"><h3>You have No Messages</h3></td></tr>');
N.push("</tbody>");N.push("</table>");N.push("</div>");function O(R){if(air.NativeApplication.supportsSystemTrayIcon){air.NativeApplication.nativeApplication.icon.bitmaps=new Array(R.target.content.bitmapData);
air.NativeApplication.nativeApplication.icon.tooltip="Serebra Connect Alerts Is Online";
return}}var Q=new runtime.flash.display.Loader();Q.contentLoaderInfo.addEventListener(air.Event.COMPLETE,O);
Q.load(new air.URLRequest("app:/assets/images/icon_desktop_16.png"))}jQuery("#outer-table-wrapper",M).append(N.join(""));
jQuery("#message-table tbody tr",M).unbind("click.hilight").bind("click.hilight",function(){jQuery("#message-table tbody tr",M).css({"background-color":"transparent"});
jQuery(this).css({"background-color":"#F4F7CD"});return false});jQuery("#message-table .delete",M).unbind("click.delete").bind("click.delete",function(){var R=jQuery(this).attr("rel");
Serebra.Chrome.ConfirmPrompt("Are you sure you wish to delete this message?",function(){Serebra.Messages.DeleteMessage(R,function(S){if(S){L(R)
}})});return false});jQuery("#delete-all",M).unbind("click.deleteall").bind("click.deleteall",function(){Serebra.Chrome.ConfirmPrompt("Are you sure you wish to delete all messages?",function(){var R=Serebra.Database.Query({queryString:"SELECT * FROM serebra_user_alerts"});
if(R.result.data){jQuery.each(R.result.data,function(S,T){var U=T.AlertID;Serebra.Messages.DeleteMessage(T.AlertID,function(V){if(V){L(U)
}})})}});return false});jQuery("#message-table tbody tr",M).unbind("dblclick.open").bind("dblclick.open",function(){var T=this;
var U=jQuery(this).attr("id");var S=Serebra.Database.Query({queryString:"SELECT * FROM serebra_user_alerts WHERE AlertID = "+U});
if(S.result.data){var R=S.result.data[0].objectLink;Serebra.SOAP.ConsumeAlert({authCode:Serebra.AuthCode,applicationCode:Serebra.ApplicationCode,alertID:U},function(W){var V=jQuery("consumedAlert",W).text();
if(V=="true"){Serebra.Database.Query({queryString:"UPDATE serebra_user_alerts SET messageRead = 1 WHERE AlertID = "+U});
jQuery(".unread",T).addClass("read").removeClass("unread");air.navigateToURL(new air.URLRequest(R))
}})}return false})}}}};Serebra.Chrome.MessagePopup=function(B){this.windowLoaded=function(F){var N=F.target.window.nativeWindow;
var J=F.target.window.document;if(N&&J){N.x=air.Screen.mainScreen.bounds.width-255;
N.y=0;function H(){N.close()}var L=new air.Timer(6000,1);L.addEventListener(air.TimerEvent.TIMER_COMPLETE,H);
var I=jQuery("#message-popup",J).get(0);jQuery("#window-handle",I).bind("mousedown.move",function(){N.startMove()
});jQuery(".close-button",I).click(function(){N.close();return false});jQuery(".open-message-center",I).click(function(){L.stop();
jQuery("#message-popup",J).remove();N.close();Serebra.Chrome.MessageCenter();return false
});if(Serebra.PlayPopupSound==="true"){var M=new air.Sound();M.addEventListener(air.Event.COMPLETE,G);
var K=new air.URLRequest("app:/assets/sounds/new_message.mp3");M.load(K);function G(P){var O=P.target;
O.play()}}jQuery(".message",I).html('<h2>You have <span class="green">'+B.messageCount+"</span> new alerts!</h2>");
L.start()}};var E=new air.NativeWindowInitOptions();E.systemChrome=air.NativeWindowSystemChrome.NONE;
E.transparent=true;E.type=air.NativeWindowType.LIGHTWEIGHT;var C=new air.Rectangle(0,0,255,155);
var A=air.HTMLLoader.createRootWindow(true,E,false,C);A.paintsDefaultBackground=false;
A.stage.nativeWindow.alwaysInFront=true;A.navigateInSystemBrowser=true;A.addEventListener(air.Event.COMPLETE,this.windowLoaded);
var D=false;jQuery(air.NativeApplication.nativeApplication.openedWindows).each(function(F,G){if(G.title==="Serebra Connect Alerts - Notification"){D=true
}});if(!D){A.load(new air.URLRequest("app:/assets/html/MessagePopup.html"))}};Serebra.Chrome.Settings=function(){this.windowLoaded=function(H){var F=H.target.window.nativeWindow;
var G=H.target.window.document;if(F&&G){var J=air.Screen.mainScreen.bounds.width/2;
var I=air.Screen.mainScreen.bounds.height/2;F.x=J-(F.width/2);F.y=I-(F.height/2);
var E=jQuery("#options-window",G).get(0);jQuery("#window-handle",E).bind("mousedown.move",function(){F.startMove()
});jQuery(".close-button",E).click(function(){F.close();return false});jQuery(".min-button",E).click(function(){F.minimize();
return false});jQuery("#autologin",E).attr("checked",Serebra.AutoLogin);jQuery("#autostart",E).attr("checked",Serebra.AutoStart);
jQuery("#display-popup",E).attr("checked",Serebra.DisplayPopups);jQuery("#password",E).val(Serebra.Password);
jQuery("#popup-sound",E).attr("checked",Serebra.PlayPopupSound);jQuery("#rememberme",E).attr("checked",Serebra.RememberMe);
jQuery("#username",E).val(Serebra.Username);jQuery("#checktime option",E).each(function(){if(jQuery(this).val()==Serebra.MessageCheckTime){jQuery(this).attr("selected","selected")
}});jQuery(".save",E).bind("click.save",function(){Serebra.AutoLogin=jQuery("#autologin",E).attr("checked");
Serebra.AutoStart=jQuery("#autostart",E).attr("checked");Serebra.DisplayPopups=jQuery("#display-popup",E).attr("checked");
Serebra.Password=jQuery("#password",E).val();Serebra.PlayPopupSound=jQuery("#popup-sound",E).attr("checked");
Serebra.RememberMe=jQuery("#rememberme",E).attr("checked");Serebra.Username=jQuery("#username",E).val();
Serebra.MessageCheckTime=jQuery("#checktime",E).val();Serebra.Database.SaveOrCreateOption({key:"username",value:Serebra.Username});
Serebra.Database.SaveOrCreateOption({key:"password",value:Serebra.Password});Serebra.Database.SaveOrCreateOption({key:"autologin",value:Serebra.AutoLogin});
Serebra.Database.SaveOrCreateOption({key:"rememberme",value:Serebra.RememberMe});
Serebra.Database.SaveOrCreateOption({key:"autostart",value:Serebra.AutoStart});Serebra.Database.SaveOrCreateOption({key:"checktime",value:Serebra.MessageCheckTime});
Serebra.Database.SaveOrCreateOption({key:"displaypopups",value:Serebra.DisplayPopups});
Serebra.Database.SaveOrCreateOption({key:"popupsound",value:Serebra.PlayPopupSound});
if(!Serebra.DebugMode){air.NativeApplication.nativeApplication.startAtLogin=Serebra.AutoStart
}Serebra.Network.MessageCheckTimer.stop();Serebra.Network.MessageCheckTimer.delay=Serebra.MessageCheckTime;
Serebra.Network.MessageCheckTimer.start();F.close();return false});F.orderToFront()
}};var D=new air.NativeWindowInitOptions();D.systemChrome=air.NativeWindowSystemChrome.NONE;
D.transparent=true;D.type=air.NativeWindowType.NORMAL;var B=new air.Rectangle(0,0,500,435);
var A=air.HTMLLoader.createRootWindow(true,D,false,B);A.paintsDefaultBackground=false;
A.stage.nativeWindow.alwaysInFront=false;A.navigateInSystemBrowser=true;A.addEventListener(air.Event.COMPLETE,this.windowLoaded);
var C=false;jQuery(air.NativeApplication.nativeApplication.openedWindows).each(function(E,F){if(F.title==="Serebra Connect Alerts - Settings"){C=true
}});if(!C){A.load(new air.URLRequest("app:/assets/html/Settings.html"))}};