(($)=>{
const __filters = [
	"NNP",
	"NNPS"
];
const __delimiters = [
	",","."
];
window["sanitize_text_jspos"] = (option)=>{
	var opt = option || {};
	var text = opt.text;
	var outchr = opt.outchr || "*";
	function _estimate_index(ln,words){
		var offs = 0;
		var sub = ln;
		const ret = words.map((elm)=>{
			const idx =  sub.indexOf(elm);
			const ret = {
				"idx": offs + idx,
				"word": elm
			};
			offs = ret.idx + elm.length;
			sub = sub.substr(idx + elm.length)
			return ret;
		});
		return ret;
	}
	function _replace_at(ln, rplc, idx){
		return ln.substr(0, idx) + rplc + ln.substr(idx + rplc.length);
	}
	function _sanitize_pos(ln){
		const words = new Lexer().lex(ln);
		const words_idx = _estimate_index(ln, words);
		const tags = new POSTagger().tag(words);
		tags.forEach((elm, idx)=>{
			if(-1 != __filters.indexOf(elm[1])){
				ln = _replace_at(ln, elm[0].replace(/./g, outchr), words_idx[idx].idx);
			}
		});
		return ln;
	};
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
		var result = _sanitize_pos(text);
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

