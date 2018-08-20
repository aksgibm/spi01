
((scp)=>{
	(new Promise((res,rej)=>{
		if(!scp["jQuery"]){
			let scr = document.createElement("script");
			scr.src = "//cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js";
			scr.onload = () => {
				setTimeout(()=>{
					scp["jQuery"] = jQuery;
					res(scp["jQuery"]);
				},100);
			};
			(document.getElementsByTagName("head")[0] ||
	        document.documentElement).appendChild(scr);
		}else{
			res(scp["jQuery"]);
		}
	})).then(($)=>{
		if(!scp["_scrape_acronyms"]){
			scp["_scrape_acronyms"] = ()=>{
				var output = $("#_scr_acr_output");
				if(!output.length){
					output = $("<textarea/>",{
						"id":"_scr_acr_output",
						"style":"position:fixed;top:1.5em;left:.4em;width:15em;height:15em;"
					}).appendTo($("body"));
				}
				output.val($("#bodyContent .mw-parser-output>ul>li").get()
				.map((elm)=>{
					const mt = $(elm).text().match(/^(\w+)\s[-–]\s/);
					return mt ? mt[1] : null;
				})
				.filter((elm)=>{
					return elm;
				}).reduce((prev,cur)=>{
					const mt = cur.match(/^(\w+)\s\((aka|also)\s(\w+)\)/);
					if(mt && mt.length > 3){
						prev.push(mt[1]);
						prev.push(mt[3]);
						return prev;
					}else{
						return prev.concat(cur.split(" or "));
					}
				},[]).join("\n"));
			};
		}
		scp["_scrape_acronyms"]();
	}).catch((err)=>{console.log(err);});
})(this);