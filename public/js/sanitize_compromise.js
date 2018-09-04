(($)=>{

function _validate_with_filters(tags, filters){
	return filters.some((elm)=>{
		return tags[elm];
	});
}	

const _tags_tb_filtered = [
//	"ProperNoun",
	"Place",
	"Region",
	"FirstName",
	"LastName",
	"Organization",
	"Acronym",
	"PhoneNumber",
	"Sensitive"
];
function _needs_filtered(tags, exttags){
	return _validate_with_filters(tags, _tags_tb_filtered.concat(exttags || []));
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
		var result = text;
		if(opt.extfilters){
			opt.extfilters.forEach(function(fltr){
				result = _sanitize_reg(result,fltr);
			});
		}
		const doc = nlp(result);
		result = doc.list.map((stc)=>{
			return stc.terms.map((trm)=>{
				return [trm.whitespace.before,
					_needs_filtered(trm.tags, opt.tagsfiltered) ? trm.text.replace(/./g, outchr) : trm.text,
					trm.whitespace.after
				].join("");
			}).join("");
		}).join("");
//		result = _sanitize_reg(result, /(\d|[０-９])+[-ー\/](\d|[０-９])+[-ー\/](\d|[０-９])+[-ー\/](\d|[０-９])+/g);
//		result = _sanitize_reg(result, /(\d|[０-９])+[-ー\/](\d|[０-９])+[-ー\/](\d|[０-９])+/g);
//		result = _sanitize_reg(result, /(\d|[０-９])+[-ー\/](\d|[０-９])+/g);
		result = _sanitize_reg(result, /[\w_-]+@[\w\.-]+\.\w{2,}/g);

		resolve({"result": result});
	});
};
})(jQuery);