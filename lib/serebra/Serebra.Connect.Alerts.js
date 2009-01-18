var Serebra;if(!Serebra){Serebra=function(){}}Serebra.Chrome=function(){};Serebra.Database=function(){};
Serebra.Menu=function(){};Serebra.Messages=function(){};Serebra.Network=function(){};
Serebra.SOAP=function(){};Serebra.System=function(){};Serebra.Update=function(){};
Serebra.Initialize=function(){Serebra.ApplicationName="";Serebra.ApplicationCode="";
Serebra.AuthCode=null;Serebra.AutoStart=false;Serebra.DatabaseFileName="";Serebra.DebugMode=false;
Serebra.DisplayPopups=true;Serebra.DisplayPopupsAnswers=true;Serebra.DisplayPopupsAwards=true;
Serebra.DisplayPopupsBids=true;Serebra.DisplayPopupsMessages=true;Serebra.DisplayPopupsQuestions=true;
Serebra.Errors=[];Serebra.FirstRun=false;Serebra.ForceUpdate=false;Serebra.ForceOffline=false;
Serebra.IgnoreArray=[];Serebra.JustLoaded=true;Serebra.LoggedIn=false;Serebra.MessageCheckTime=300000;
Serebra.NetworkOnline=false;Serebra.Password="";Serebra.PlayPopupSound=true;Serebra.RememberMe=false;
Serebra.UnreadMessages=false;Serebra.Username="";Serebra.UserTable="serebra_user_";
try{air.File.applicationStorageDirectory.resolvePath("update").deleteDirectory(true)
}catch(A){}air.NativeApplication.nativeApplication.addEventListener(air.InvokeEvent.INVOKE,Serebra._InvokeApplication)
};Serebra._InvokeApplication=function(A){Serebra.System.InvokeSettings(A.arguments,A.currentDirectory,function(){Serebra.Database.ConnectToFile({databaseFile:Serebra.DatabaseFileName,createFile:true});
Serebra.System.LoadDatabaseSettings(function(){Serebra.Menu.Initialize();if(Serebra.FirstRun){Serebra.Database.SetupFirstRun(function(){Serebra.Chrome.LoginWindow(function(){Serebra.Network.CheckLogin()
})})}else{Serebra.Chrome.LoginWindow(function(){Serebra.Network.CheckLogin()})}})
})};Serebra.Database.DatabaseFile=null;Serebra.Database.ConnectToFile=function(A){function B(){return{airDir:"applicationStorageDirectory",databaseFile:"",createFile:true}
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
Serebra.Database.Query({queryString:'INSERT INTO serebra_options VALUES("displaypopups", "true");'});
Serebra.Database.Query({queryString:'INSERT INTO serebra_options VALUES("popupsound", "true");'});
Serebra.Database.Query({queryString:'INSERT INTO serebra_options VALUES("show_bids", "true");'});
Serebra.Database.Query({queryString:'INSERT INTO serebra_options VALUES("show_messages", "true");'});
Serebra.Database.Query({queryString:'INSERT INTO serebra_options VALUES("show_questions", "true");'});
Serebra.Database.Query({queryString:'INSERT INTO serebra_options VALUES("show_answers", "true");'});
Serebra.Database.Query({queryString:'INSERT INTO serebra_options VALUES("show_awards", "true");'});
if(typeof A==="function"){return A()}};Serebra.Database.UserTable=function(B){Serebra.UserTable=Serebra.UserTable+Serebra.Username.toLowerCase();
var A=Serebra.Database.Query({queryString:"SELECT * FROM "+Serebra.UserTable});if(!A.result.data){Serebra.Database.Query({queryString:"CREATE TABLE IF NOT EXISTS "+Serebra.UserTable+" (AlertID INTEGER PRIMARY KEY, Type TEXT, alertText TEXT, userLink TEXT, objectLink TEXT, messageRead INTEGER);"})
}return B()};Serebra.Menu.CreateLoginMenu=function(){air.NativeApplication.nativeApplication.icon.menu=new air.NativeMenu();
air.NativeApplication.nativeApplication.icon.addEventListener("click",Serebra.Menu.SystrayClickHandler);
var A={serebraConnect:new air.NativeMenuItem("Open Serebra Connect",false),loginMenu:new air.NativeMenuItem("Login",false),whatsThis:new air.NativeMenuItem("Whats This?",false),closeMenu:new air.NativeMenuItem("Exit",false)};
jQuery.each(A,function(B,C){air.NativeApplication.nativeApplication.icon.menu.addItem(C);
C.addEventListener(air.Event.SELECT,Serebra.Menu.MenuItemClickHandler)})};Serebra.Menu.CreateSystrayMenu=function(){air.NativeApplication.nativeApplication.icon.menu=new air.NativeMenu();
air.NativeApplication.nativeApplication.icon.addEventListener("click",Serebra.Menu.SystrayClickHandler);
var A={serebraConnect:new air.NativeMenuItem("Open Serebra Connect",false),messageCenter:new air.NativeMenuItem("Open Alerts Center",false),updatesMenu:new air.NativeMenuItem("Check For Updates",false),optionsMenu:new air.NativeMenuItem("Settings",false),logoutMenu:new air.NativeMenuItem("Logout",false),whatsThis:new air.NativeMenuItem("Whats This?",false),closeMenu:new air.NativeMenuItem("Exit",false)};
if(Serebra.DebugMode){A=jQuery.extend({fakeAlerts:new air.NativeMenuItem("Create Fake Alert",false)},A)
}jQuery.each(A,function(B,C){air.NativeApplication.nativeApplication.icon.menu.addItem(C);
C.addEventListener(air.Event.SELECT,Serebra.Menu.MenuItemClickHandler)})};Serebra.Menu.Initialize=function(){function A(C){if(air.NativeApplication.supportsSystemTrayIcon){air.NativeApplication.nativeApplication.icon.bitmaps=new Array(C.target.content.bitmapData);
Serebra.Menu.CreateLoginMenu()}}var B=new runtime.flash.display.Loader();B.contentLoaderInfo.addEventListener(air.Event.COMPLETE,A);
B.load(new air.URLRequest("app:/assets/images/icon_tray_off.png"))};Serebra.Menu.MenuItemClickHandler=function(A){switch(A.target.label){case"Open Serebra Connect":air.navigateToURL(new air.URLRequest("http://www.serebraconnect.com/"));
break;case"Open Alerts Center":Serebra.Chrome.AlertCenter();break;case"Settings":Serebra.Chrome.Settings();
break;case"Create Fake Alert":Serebra.SOAP.CreateFakeAlert(null,function(){});break;
case"Check For Updates":Serebra.Update.InvokeApplicationUpdate({updateXML:"http://dev.ifies.org/descriptor/update.xml",displayFail:true});
break;case"Login":Serebra.Chrome.LoginWindow(function(){Serebra.Network.CheckLogin()
});break;case"Logout":Serebra.Network.Logout();break;case"Whats This?":Serebra.Chrome.WhatsThis();
break;case"Exit":air.NativeApplication.nativeApplication.exit();break;default:break
}return};Serebra.Menu.SystrayClickHandler=function(A){if(Serebra.NetworkOnline){Serebra.Chrome.AlertCenter()
}else{Serebra.Chrome.LoginWindow(function(){Serebra.Network.CheckLogin()})}};Serebra.Messages.DeleteMessage=function(E,D){var A=false;
var C=Serebra.Database.Query({queryString:"SELECT * FROM "+Serebra.UserTable+" WHERE AlertID = "+E});
if(C.result.data){if(!C.result.data[0].messageRead){Serebra.SOAP.ConsumeAlert({authCode:Serebra.AuthCode,applicationCode:Serebra.ApplicationCode,alertID:E},function(F){var I=jQuery("errorFlag",F).text();
var H=jQuery("errorString",F).text();var G;if(I=="false"){G=Serebra.Database.Query({queryString:"DELETE FROM "+Serebra.UserTable+" WHERE AlertID = "+E});
if(G.success){A=true}}else{if(H=="you don't own that alert"){G=Serebra.Database.Query({queryString:"DELETE FROM "+Serebra.UserTable+" WHERE AlertID = "+E});
if(G.success){A=true}}}return D(A)})}else{var B=Serebra.Database.Query({queryString:"DELETE FROM "+Serebra.UserTable+" WHERE AlertID = "+E});
if(B.result.complete){A=true}}}return D(A)};Serebra.Network.CheckConnectivity=function(A){air.trace("Network gone offline")
};Serebra.Network.CheckURL=function(A){if(A.currentTarget.available){Serebra.Network.Online()
}else{Serebra.Network.Logout()}};Serebra.Network.CheckLogin=function(A){Serebra.SOAP.Authenticate({username:Serebra.Username,password:Serebra.Password,applicationCode:Serebra.ApplicationCode},function(B){var D=jQuery("errorFlag",B).text();
if(D=="false"){Serebra.LoggedIn=true;Serebra.AuthCode=jQuery("authCode",B).text();
Serebra.Menu.CreateSystrayMenu();Serebra.IgnoreArray.push(["ANSWER",Serebra.DisplayPopupsAnswers]);
Serebra.IgnoreArray.push(["AWARD",Serebra.DisplayPopupsAwards]);Serebra.IgnoreArray.push(["BID",Serebra.DisplayPopupsBids]);
Serebra.IgnoreArray.push(["MESSAGE",Serebra.DisplayPopupsMessages]);Serebra.IgnoreArray.push(["QUESTION",Serebra.DisplayPopupsQuestions]);
Serebra.Database.UserTable(function(){Serebra.Network.Initialize(Serebra.MessageCheckTime);
Serebra.Chrome.AlertCenter()})}else{var C=jQuery("errorString",B).text();if(C===""){C="Unknown Error"
}Serebra.Errors.push("Login Error: "+C);Serebra.Chrome.LoginWindow(function(E){Serebra.Network.CheckLogin(E)
})}})};Serebra.Network.CheckMessages=function(){Serebra.SOAP.GetUserAlerts({authCode:Serebra.AuthCode,applicationCode:Serebra.ApplicationCode},function(A){jQuery("alert",A).each(function(){var L=jQuery(this).attr("id");
var H=jQuery("type",this).text();var K=jQuery("alertText",this).text();var J=jQuery("userLink",this).text();
var G=jQuery("objectLink",this).text();var I=Serebra.Database.Query({queryString:"SELECT * FROM "+Serebra.UserTable+" WHERE AlertID = "+L});
if(!I.result.data){Serebra.Database.Query({queryString:"INSERT INTO "+Serebra.UserTable+" VALUES("+L+',"'+H+'","'+K+'","'+J+'","'+G+'",0)'})
}});var D=0;var E=Serebra.Database.Query({queryString:"SELECT * FROM "+Serebra.UserTable+" WHERE messageRead = 0"});
if(E.result.data){jQuery.each(E.result.data,function(G,H){jQuery.each(Serebra.IgnoreArray,function(I,J){if(H.Type===J[0]){if(J[1]){D++
}}})})}if(D){var B="alerts";if(D===1){B="alert"}if(Serebra.DisplayPopups){Serebra.Chrome.Popup({message:'<h2>You have <span class="green">'+D+"</span> new "+B+"!</h2>",showLink:true,popupLife:6000})
}function C(G){if(air.NativeApplication.supportsSystemTrayIcon){air.NativeApplication.nativeApplication.icon.bitmaps=new Array(G.target.content.bitmapData);
air.NativeApplication.nativeApplication.icon.tooltip="Serebra Connect Alerts - You have unread messages"
}}var F=new runtime.flash.display.Loader();F.contentLoaderInfo.addEventListener(air.Event.COMPLETE,C);
F.load(new air.URLRequest("app:/assets/images/icon_tray_new.png"))}})};Serebra.Network.Monitor=null;
Serebra.Network.MessageCheckTimer=null;Serebra.Network.Initialize=function(B){air.NativeApplication.nativeApplication.addEventListener(air.Event.NETWORK_CHANGE,Serebra.Network.CheckConnectivity);
var A=new air.URLRequest("http://qa.serebracampus.com:8888/apiWebService.cfc?wsdl");
Serebra.Network.Monitor=new air.URLMonitor(A);Serebra.Network.Monitor.addEventListener(air.StatusEvent.STATUS,Serebra.Network.CheckURL);
Serebra.Network.Monitor.start()};Serebra.Network.Logout=function(){Serebra.NetworkOnline=false;
function A(C){if(air.NativeApplication.supportsSystemTrayIcon){air.NativeApplication.nativeApplication.icon.bitmaps=new Array(C.target.content.bitmapData);
air.NativeApplication.nativeApplication.icon.tooltip="Serebra Connect Alerts Is Offline";
jQuery(air.NativeApplication.nativeApplication.openedWindows).each(function(D,E){if(E.title!=="Serebra Connect Alerts"){E.close()
}});Serebra.UserTable="serebra_user_";Serebra.JustLoaded=true;if(Serebra.RememberMe=="false"||!Serebra.RememberMe){Serebra.Username="";
Serebra.Password=""}Serebra.Network.MessageCheckTimer.stop();Serebra.Menu.CreateLoginMenu()
}}var B=new runtime.flash.display.Loader();B.contentLoaderInfo.addEventListener(air.Event.COMPLETE,A);
B.load(new air.URLRequest("app:/assets/images/icon_tray_off.png"))};Serebra.Network.Online=function(){Serebra.NetworkOnline=true;
function A(C){if(air.NativeApplication.supportsSystemTrayIcon){air.NativeApplication.nativeApplication.icon.bitmaps=new Array(C.target.content.bitmapData);
air.NativeApplication.nativeApplication.icon.tooltip="Serebra Connect Alerts Is Online";
Serebra.Update.InvokeApplicationUpdate({updateXML:"http://dev.ifies.org/descriptor/update.xml",displayFail:false});
Serebra.Network.CheckMessages();Serebra.Network.MessageCheckTimer=new air.Timer(Serebra.MessageCheckTime,0);
Serebra.Network.MessageCheckTimer.addEventListener(air.TimerEvent.TIMER,Serebra.Network.CheckMessages);
Serebra.Network.MessageCheckTimer.start();return}}var B=new runtime.flash.display.Loader();
B.contentLoaderInfo.addEventListener(air.Event.COMPLETE,A);B.load(new air.URLRequest("app:/assets/images/icon_tray_on.png"));
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
if(A.result.data){jQuery.each(A.result.data,function(C,D){switch(D.key){case"autostart":Serebra.AutoStart=((D.value==="true")?true:false);
break;case"checktime":Serebra.MessageCheckTime=parseInt(D.value,10);break;case"password":Serebra.Password=D.value;
break;case"rememberme":Serebra.RememberMe=((D.value==="true")?true:false);break;case"username":Serebra.Username=D.value;
break;case"displaypopups":Serebra.DisplayPop=((D.value==="true")?true:false);break;
case"popupsound":Serebra.PlayPopupSound=((D.value==="true")?true:false);break;case"show_answers":Serebra.DisplayPopupsAnswers=((D.value==="true")?true:false);
break;case"show_awards":Serebra.DisplayPopupsAwards=((D.value==="true")?true:false);
break;case"show_bids":Serebra.DisplayPopupsBids=((D.value==="true")?true:false);break;
case"show_messages":Serebra.DisplayPopupsMessages=((D.value==="true")?true:false);
break;case"show_questions":Serebra.DisplayPopupsQuestions=((D.value==="true")?true:false);
break;default:break}})}if(typeof B==="function"){return B()}else{throw new Error("You must return a callback with this function")
}};Serebra.Update.AppVersionCheck=function(A){var C=jQuery(A.target.data).find("version").text();
var B=C.split(".");var I=jQuery(A.target.data).find("url").text();var J=air.NativeApplication.nativeApplication.applicationDescriptor;
var E=new DOMParser();var H=E.parseFromString(J,"text/xml");var K=H.getElementsByTagName("application")[0];
var D=K.getElementsByTagName("version")[0].firstChild.data;D=D.split(".");var F=false;
var M=new air.URLStream();jQuery.each(B,function(O,P){if(P>D[O]){F=true}});if(F){var L=confirm("We have found an update for Serebra Connect Alerts.  Would you like to download now?");
if(L){jQuery(air.NativeApplication.nativeApplication.openedWindows).each(function(O,P){if(P.title==="Serebra Connect Alerts - Notification"){P.close()
}});Serebra.Chrome.Popup({message:"<h2>Downloading Update</h2>",showLink:false,popupLife:6000});
M.addEventListener(air.ProgressEvent.PROGRESS,N);M.addEventListener(air.Event.COMPLETE,G);
M.load(new air.URLRequest(I))}}else{if(Serebra.Update.ShowFail){alert("No updates have been found at this time.");
Serebra.Update.ShowFail=false}}function N(P){var O=Math.round((P.bytesLoaded/P.bytesTotal)*100)
}function G(P){var O="update/SRDesktop-"+C+".air";var R=new air.ByteArray();M.readBytes(R,0,M.bytesAvailable);
updateFile=air.File.applicationStorageDirectory.resolvePath(O);fileStream=new air.FileStream();
fileStream.addEventListener(air.Event.CLOSE,Q);fileStream.openAsync(updateFile,air.FileMode.WRITE);
fileStream.writeBytes(R,0,R.length);fileStream.close();function Q(S){var T=new air.Updater();
T.update(updateFile,C)}}};Serebra.Update.ShowFail=false;Serebra.Update.InvokeApplicationUpdate=function(B){function D(){return{updateXML:""}
}B=jQuery.extend(D(),B);var C=new air.URLRequest(B.updateXML);var A=new air.URLLoader();
Serebra.Update.ShowFail=B.displayFail;A.addEventListener(air.Event.COMPLETE,Serebra.Update.AppVersionCheck);
A.load(C)};Serebra.Chrome.AlertCenter=function(){this.Initialise=function(){var E=new air.NativeWindowInitOptions();
E.systemChrome=air.NativeWindowSystemChrome.NONE;E.type=air.NativeWindowType.NORMAL;
E.transparent=true;var D=new air.Rectangle(0,0,640,385);var B=air.HTMLLoader.createRootWindow(false,E,false,D);
B.paintsDefaultBackground=false;B.stage.nativeWindow.alwaysInFront=false;B.navigateInSystemBrowser=true;
B.addEventListener(air.Event.COMPLETE,this.CreateWindow);try{B.load(new air.URLRequest("app:/assets/html/MessageCenter.html"))
}catch(C){air.Introspector.Console.log(C)}};this.CreateWindow=function(B){var H=jQuery("#message-center",B.target.window.document).get(0);
function G(){B.target.window.nativeWindow.visible=false;return false}function C(){B.target.window.nativeWindow.minimize();
return false}function D(){B.target.window.nativeWindow.startMove()}function J(K){jQuery("tr#"+K,H).remove();
I()}function I(){jQuery("#window-handle",H).unbind("mousedown.move").bind("mousedown.move",D);
jQuery(".close-button",H).unbind("click.close").bind("click.close",G);jQuery(".min-button",H).unbind("click.min").bind("click.min",C);
jQuery("#inner-table-wrapper",H).remove();var M=Serebra.Database.Query({queryString:"SELECT * FROM "+Serebra.UserTable+" ORDER BY AlertID DESC"});
var K=[];K.push('<div id="inner-table-wrapper">');K.push('<table id="message-table" cellspacing="0" cellpadding="0" width="100%">');
K.push("<thead>");K.push("<tr>");K.push("<th>&nbsp;</th>");K.push("<th>Type</th>");
K.push("<th>Details</th>");K.push("<th>&nbsp;</th>");K.push("</tr>");K.push("</thead>");
K.push("<tbody>");if(M.result.data!==null){jQuery.each(M.result.data,function(O,P){K.push('<tr id="'+P.AlertID+'">');
switch(P.messageRead){case 0:K.push('<td width="55"><span class="unread">Unread</span></td>');
break;case 1:K.push('<td width="55"><span class="read">Read</span></td>');break;default:break
}K.push('<td width="55">'+P.Type+"</td>");K.push('<td width="450">'+P.alertText+"</td>");
K.push('<td width="55"><a class="delete" href="#" rel="'+P.AlertID+'"><span>Delete</span<</a></td>');
K.push("</tr>")});K.push("</tbody>");K.push("</table>");K.push("</div>")}else{K.push('<tr width="100%"><td colspan="5" width="100%"><h3>You have No Messages</h3></td></tr>');
K.push("</tbody>");K.push("</table>");K.push("</div>");function L(O){if(air.NativeApplication.supportsSystemTrayIcon){air.NativeApplication.nativeApplication.icon.bitmaps=new Array(O.target.content.bitmapData);
air.NativeApplication.nativeApplication.icon.tooltip="Serebra Connect Alerts Is Online";
return}}var N=new runtime.flash.display.Loader();N.contentLoaderInfo.addEventListener(air.Event.COMPLETE,L);
N.load(new air.URLRequest("app:/assets/images/icon_tray_on.png"))}jQuery("#outer-table-wrapper",H).append(K.join(""));
jQuery("#message-table tbody tr",H).unbind("click.hilight").bind("click.hilight",function(){jQuery("#message-table tbody tr",H).css({"background-color":"transparent"});
jQuery(this).css({"background-color":"#F4F7CD"});return false});jQuery("#message-table .delete",H).unbind("click.delete").bind("click.delete",function(){var O=jQuery(this).attr("rel");
Serebra.Chrome.ConfirmPrompt("Are you sure you wish to delete this message?",function(){Serebra.Messages.DeleteMessage(O,function(P){if(P){J(O)
}})});return false});jQuery("#delete-all",H).unbind("click.deleteall").bind("click.deleteall",function(){Serebra.Chrome.ConfirmPrompt("Are you sure you wish to delete all messages?",function(){var O=Serebra.Database.Query({queryString:"SELECT * FROM "+Serebra.UserTable});
if(O.result.data){jQuery.each(O.result.data,function(P,Q){var R=Q.AlertID;Serebra.Messages.DeleteMessage(Q.AlertID,function(S){if(S){J(R)
}})})}});return false});jQuery("#message-table tbody tr",H).unbind("dblclick.open").bind("dblclick.open",function(){var Q=this;
var R=jQuery(this).attr("id");var P=Serebra.Database.Query({queryString:"SELECT * FROM "+Serebra.UserTable+" WHERE AlertID = "+R});
if(P.result.data){var O=P.result.data[0].objectLink;air.navigateToURL(new air.URLRequest(O));
Serebra.SOAP.ConsumeAlert({authCode:Serebra.AuthCode,applicationCode:Serebra.ApplicationCode,alertID:R},function(T){var S=jQuery("consumedAlert",T).text();
if(S=="true"){Serebra.Database.Query({queryString:"UPDATE "+Serebra.UserTable+" SET messageRead = 1 WHERE AlertID = "+R});
jQuery(".unread",Q).addClass("read").removeClass("unread");function U(X){if(air.NativeApplication.supportsSystemTrayIcon){air.NativeApplication.nativeApplication.icon.bitmaps=new Array(X.target.content.bitmapData);
air.NativeApplication.nativeApplication.icon.tooltip="Serebra Connect Alerts Is Online"
}}var V=Serebra.Database.Query({queryString:"SELECT * FROM "+Serebra.UserTable+" WHERE messageRead = 0"});
if(!V.result.data){var W=new runtime.flash.display.Loader();W.contentLoaderInfo.addEventListener(air.Event.COMPLETE,U);
W.load(new air.URLRequest("app:/assets/images/icon_tray_on.png"))}}})}return false
})}if(B.type==="complete"&&B.target.window.nativeWindow){var F=air.Screen.mainScreen.bounds.width/2;
var E=air.Screen.mainScreen.bounds.height/2;B.target.window.nativeWindow.x=F-(B.target.window.nativeWindow.width/2);
B.target.window.nativeWindow.y=E-(B.target.window.nativeWindow.height/2);B.target.window.nativeWindow.addEventListener(air.Event.ACTIVATE,I)
}};var A=false;jQuery(air.NativeApplication.nativeApplication.openedWindows).each(function(B,C){if(C.title==="Serebra Connect Alerts - Alert Center"){A=true;
C.visible=true;C.activate();C.orderToFront()}});if(!A){this.Initialise()}};Serebra.Chrome.ConfirmPrompt=function(C,F){this.windowLoaded=function(H){var G=H.target.window;
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
var F=jQuery("#login-area",H).get(0);jQuery("#password",F).val(Serebra.Password);
jQuery("#rememberme",F).attr("checked",Serebra.RememberMe);jQuery("#username",F).val(Serebra.Username);
jQuery("#window-handle",F).bind("mousedown.move",function(){G.startMove()});jQuery(".close-button, #cancel",F).click(function(){G.close();
return false});jQuery("#login",F).click(function(){Serebra.Password=jQuery("#password",F).val();
Serebra.RememberMe=jQuery("#rememberme",F).attr("checked");Serebra.Username=jQuery("#username",F).val();
if(Serebra.RememberMe===true){Serebra.Database.SaveOrCreateOption({key:"password",value:Serebra.Password});
Serebra.Database.SaveOrCreateOption({key:"rememberme",value:Serebra.RememberMe});
Serebra.Database.SaveOrCreateOption({key:"username",value:Serebra.Username})}else{Serebra.Database.SaveOrCreateOption({key:"username",value:""});
Serebra.Database.SaveOrCreateOption({key:"password",value:""});Serebra.Database.SaveOrCreateOption({key:"rememberme",value:""})
}G.close();return E()});jQuery("#create-account",F).click(function(){var M=jQuery(this).attr("href");
air.navigateToURL(new air.URLRequest(M));return false});if(Serebra.Errors.length>0){var L=[];
jQuery.each(Serebra.Errors,function(N,M){L.push("<li>"+M+"</li>")});Serebra.Errors=[];
jQuery("#form-errors ul",F).append(L.join(""));jQuery("#form-errors",F).fadeIn()}}};
var D=new air.NativeWindowInitOptions();D.systemChrome=air.NativeWindowSystemChrome.NONE;
D.transparent=true;D.type=air.NativeWindowType.NORMAL;var B=new air.Rectangle(0,0,318,285);
var A=air.HTMLLoader.createRootWindow(true,D,false,B);A.paintsDefaultBackground=false;
A.stage.nativeWindow.alwaysInFront=true;A.navigateInSystemBrowser=true;A.addEventListener(air.Event.COMPLETE,this.windowLoaded);
var C=false;jQuery(air.NativeApplication.nativeApplication.openedWindows).each(function(F,G){if(G.title==="Serebra Connect Alerts - Log In"){C=true
}});if(!C){A.load(new air.URLRequest("app:/assets/html/LoginWindow.html"))}};Serebra.Chrome.OKPrompt=function(C,F){this.windowLoaded=function(H){var G=H.target.window;
if(G.nativeWindow&&G.document){var J=air.Screen.mainScreen.bounds.width/2;var I=air.Screen.mainScreen.bounds.height/2;
G.nativeWindow.x=J-(G.nativeWindow.width/2);G.nativeWindow.y=I-(G.nativeWindow.height/2);
var K=jQuery("#confirm-message",G.document).get(0);G.nativeWindow.height=jQuery("#confirm-message",G.document).height()+100;
jQuery("#window-handle",K).bind("mousedown.move",function(){G.nativeWindow.startMove()
});jQuery(".close-button",K).click(function(){G.close();return false});jQuery(".message",K).html("<h2>"+C+"</h2>");
jQuery(".confirm-button",K).click(function(){var M=jQuery(this).val();var L;if(M==="OK"){G.close();
return F()}G.close();return false})}};var E=new air.NativeWindowInitOptions();E.systemChrome=air.NativeWindowSystemChrome.NONE;
E.transparent=true;E.type=air.NativeWindowType.LIGHTWEIGHT;var B=new air.Rectangle(0,0,255,155);
var A=air.HTMLLoader.createRootWindow(true,E,false,B);A.paintsDefaultBackground=false;
A.stage.nativeWindow.alwaysInFront=true;A.navigateInSystemBrowser=true;A.addEventListener(air.Event.COMPLETE,this.windowLoaded);
var D=false;jQuery(air.NativeApplication.nativeApplication.openedWindows).each(function(G,H){if(H.title==="Serebra Connect Alerts - Confirm"){D=true
}});if(!D){A.load(new air.URLRequest("app:/assets/html/OKPrompt.html"))}};Serebra.Chrome.Popup=function(A){this.Initialise=function(){var D=new air.NativeWindowInitOptions();
D.systemChrome=air.NativeWindowSystemChrome.NONE;D.type=air.NativeWindowType.LIGHTWEIGHT;
D.transparent=true;var C=new air.Rectangle(0,0,255,155);var B=air.HTMLLoader.createRootWindow(false,D,false,C);
B.paintsDefaultBackground=false;B.stage.nativeWindow.alwaysInFront=true;B.navigateInSystemBrowser=true;
B.addEventListener(air.Event.COMPLETE,this.CreateWindow);B.load(new air.URLRequest("app:/assets/html/MessagePopup.html"))
};this.CreateWindow=function(G){var I=jQuery("#message-popup",G.target.window.document).get(0);
var B=new air.Timer(A.popupLife,1);function F(){G.target.window.close();return false
}function E(){G.target.window.nativeWindow.startMove()}function H(){function J(N){var M=N.target;
M.play()}var L=new air.Sound();L.addEventListener(air.Event.COMPLETE,J);var K=new air.URLRequest("app:/assets/sounds/new_message.mp3");
L.load(K)}function C(){B.stop();Serebra.Chrome.AlertCenter();F();return false}function D(){jQuery("#window-handle",I).bind("mousedown.move",E);
jQuery(".close-button",I).bind("click.close",F);jQuery(".message",I).html(A.message);
if(A.showLink){jQuery(".open-message-center",I).css({display:"block"}).bind("click.messageCenter",C)
}}if(G.type==="complete"&&G.target.window.nativeWindow){G.target.window.nativeWindow.x=air.Screen.mainScreen.bounds.width-255;
G.target.window.nativeWindow.y=air.Screen.mainScreen.bounds.height-155;G.target.window.nativeWindow.addEventListener(air.Event.ACTIVATE,D);
B.addEventListener(air.TimerEvent.TIMER,F);G.target.window.nativeWindow.activate();
if(Serebra.PlayPopupSound==="true"){H()}G.target.window.nativeWindow.visible=true;
B.start()}};this.Initialise()};Serebra.Chrome.Settings=function(A){this.Initialise=function(){var D=new air.NativeWindowInitOptions();
D.systemChrome=air.NativeWindowSystemChrome.NONE;D.type=air.NativeWindowType.NORMAL;
D.transparent=true;var C=new air.Rectangle(0,0,500,435);var B=air.HTMLLoader.createRootWindow(false,D,false,C);
B.paintsDefaultBackground=false;B.stage.nativeWindow.alwaysInFront=true;B.navigateInSystemBrowser=true;
B.addEventListener(air.Event.COMPLETE,this.CreateWindow);B.load(new air.URLRequest("app:/assets/html/Settings.html"))
};this.CreateWindow=function(F){var I=jQuery("#options-window",F.target.window.document).get(0);
function E(){F.target.window.nativeWindow.visible=false;return false}function C(){F.target.window.nativeWindow.minimize();
return false}function D(){F.target.window.nativeWindow.startMove()}function B(){jQuery("#window-handle",I).bind("mousedown.move",D);
jQuery(".close-button",I).bind("click.close",E);jQuery(".min-button",I).bind("click.min",C);
jQuery("#autostart",I).attr("checked",Serebra.AutoStart);jQuery("#display-answers",I).attr("checked",Serebra.DisplayPopupsAnswers);
jQuery("#display-awards",I).attr("checked",Serebra.DisplayPopupsAwards);jQuery("#display-bids",I).attr("checked",Serebra.DisplayPopupsBids);
jQuery("#display-messages",I).attr("checked",Serebra.DisplayPopupsMessages);jQuery("#display-popup",I).attr("checked",Serebra.DisplayPopups);
jQuery("#display-questions",I).attr("checked",Serebra.DisplayPopupsQuestions);jQuery("#popup-sound",I).attr("checked",Serebra.PlayPopupSound);
jQuery("#checktime option",I).each(function(){if(jQuery(this).val()==Serebra.MessageCheckTime){jQuery(this).attr("selected","selected")
}});jQuery(".save",I).bind("click.save",function(){Serebra.AutoStart=jQuery("#autostart",I).attr("checked");
Serebra.DisplayPopups=jQuery("#display-popup",I).attr("checked");Serebra.DisplayPopupsAnswers=jQuery("#display-answers",I).attr("checked");
Serebra.DisplayPopupsAwards=jQuery("#display-awards",I).attr("checked");Serebra.DisplayPopupsBids=jQuery("#display-bids",I).attr("checked");
Serebra.DisplayPopupsMessages=jQuery("#display-messages",I).attr("checked");Serebra.DisplayPopupsQuestions=jQuery("#display-questions",I).attr("checked");
Serebra.PlayPopupSound=jQuery("#popup-sound",I).attr("checked");Serebra.RememberMe=jQuery("#rememberme",I).attr("checked");
Serebra.MessageCheckTime=jQuery("#checktime",I).val();Serebra.Database.SaveOrCreateOption({key:"autostart",value:Serebra.AutoStart});
Serebra.Database.SaveOrCreateOption({key:"displaypopups",value:Serebra.DisplayPopups});
Serebra.Database.SaveOrCreateOption({key:"show_answers",value:Serebra.DisplayPopupsAnswers});
Serebra.Database.SaveOrCreateOption({key:"show_awards",value:Serebra.DisplayPopupsAwards});
Serebra.Database.SaveOrCreateOption({key:"show_bids",value:Serebra.DisplayPopupsBids});
Serebra.Database.SaveOrCreateOption({key:"show_messages",value:Serebra.DisplayPopupsMessages});
Serebra.Database.SaveOrCreateOption({key:"show_questions",value:Serebra.DisplayPopupsQuestions});
Serebra.Database.SaveOrCreateOption({key:"checktime",value:Serebra.MessageCheckTime});
Serebra.Database.SaveOrCreateOption({key:"popupsound",value:Serebra.PlayPopupSound});
if(!Serebra.DebugMode){air.NativeApplication.nativeApplication.startAtLogin=Serebra.AutoStart
}Serebra.Network.MessageCheckTimer.stop();Serebra.Network.MessageCheckTimer.delay=Serebra.MessageCheckTime;
Serebra.Network.MessageCheckTimer.start();Serebra.IgnoreArray=[];Serebra.IgnoreArray.push(["ANSWER",Serebra.DisplayPopupsAnswers]);
Serebra.IgnoreArray.push(["AWARD",Serebra.DisplayPopupsAwards]);Serebra.IgnoreArray.push(["BID",Serebra.DisplayPopupsBids]);
Serebra.IgnoreArray.push(["MESSAGE",Serebra.DisplayPopupsMessages]);Serebra.IgnoreArray.push(["QUESTION",Serebra.DisplayPopupsQuestions]);
Serebra.Chrome.OKPrompt("Your settings will take affect the next time you log in.",function(){F.target.window.close()
});return false});F.target.window.nativeWindow.orderToFront()}if(F.type==="complete"&&F.target.window.nativeWindow){var H=air.Screen.mainScreen.bounds.width/2;
var G=air.Screen.mainScreen.bounds.height/2;F.target.window.nativeWindow.x=H-(F.target.window.nativeWindow.width/2);
F.target.window.nativeWindow.y=G-(F.target.window.nativeWindow.height/2);B();F.target.window.nativeWindow.visible=true
}};this.Initialise()};Serebra.Chrome.WhatsThis=function(A){this.Initialise=function(){var D=new air.NativeWindowInitOptions();
D.systemChrome=air.NativeWindowSystemChrome.NONE;D.type=air.NativeWindowType.LIGHTWEIGHT;
D.transparent=true;var C=new air.Rectangle(0,0,300,300);var B=air.HTMLLoader.createRootWindow(false,D,false,C);
B.paintsDefaultBackground=false;B.stage.nativeWindow.alwaysInFront=true;B.navigateInSystemBrowser=true;
B.addEventListener(air.Event.COMPLETE,this.CreateWindow);B.load(new air.URLRequest("app:/assets/html/WhatsThis.html"))
};this.CreateWindow=function(E){var F=jQuery("#message-popup",E.target.window.document).get(0);
function D(){E.target.window.close();return false}function C(){E.target.window.nativeWindow.startMove()
}function B(){jQuery("#window-handle",F).bind("mousedown.move",C);jQuery(".close-button",F).bind("click.close",D);
jQuery("#ok-button",F).bind("click.ok",D)}if(E.type==="complete"&&E.target.window.nativeWindow){E.target.window.nativeWindow.x=air.Screen.mainScreen.bounds.width-300;
E.target.window.nativeWindow.y=air.Screen.mainScreen.bounds.height-240;B();E.target.window.nativeWindow.visible=true
}};this.Initialise()};