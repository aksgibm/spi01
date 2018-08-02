(($)=>{

function _needs_filtered(tags){
	return tags.Noun && (tags.ProperNoun || tags.Place || tags.Region || tags.FirstName || tags.LastName || tags.Organization || tags.Acronym);
}

window["sanitize_text_compromise"] = (option)=>{
	var opt = option || {};
	var text = opt.text;
	var outchr = opt.outchr || "*";
	function _sanitize_reg(itxt, rexp){
		var matches = itxt.match(rexp);
		if(matches){
			matches.forEach(function(mtch){
				itxt = itxt.replace(mtch, mtch.replace(/./g, outchr));
			})
		}
		return itxt;
	}
	return new Promise((resolve,reject)=>{
		const doc = nlp(text);
		var result = doc.list.map((stc)=>{
			return stc.terms.map((trm)=>{
				return [trm.whitespace.before,
					_needs_filtered(trm.tags) ? trm.text.replace(/./g, outchr) : trm.text,
					trm.whitespace.after
				].join("");
			}).join("");
		}).join("");
		result = _sanitize_reg(result, /(\d|[０-９])+[-ー\/](\d|[０-９])+[-ー\/](\d|[０-９])+[-ー\/](\d|[０-９])+/g);
		result = _sanitize_reg(result, /(\d|[０-９])+[-ー\/](\d|[０-９])+[-ー\/](\d|[０-９])+/g);
		result = _sanitize_reg(result, /(\d|[０-９])+[-ー\/](\d|[０-９])+/g);
		result = _sanitize_reg(result, /[\w_-]+@[\w\.-]+\.\w{2,}/g);
		if(opt.extfilters){
			opt.extfilters.forEach(function(fltr){
				result = _sanitize_reg(result,fltr);
			});
		}
		resolve({"result": result});
	});
};
})(jQuery);