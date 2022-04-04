if("serviceWorker" in navigator){
  window.addEventListener("load", function () {
    navigator.serviceWorker.getRegistrations().then((r)=>{r[0].unregister()})

    navigator.serviceWorker.register("/Mini-Blackjack/serviceWorker.js").then(function(registration){
      console.log("Service Worker Registered");
    }).catch(function(err){
      console.log("Service Worker Not Register", err);
    });
  })
}