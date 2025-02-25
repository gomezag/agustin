
class SubBar {
	constructor(name, color, bar) {
	    this.div = document.createElement('div');
	    this.div.setAttribute('data-subbar-name', name);
	    this.div.classList.add("sub-bar");
	    this.div.style.setProperty("background-color", color);
	    this.bar = bar;
	    bar.div.appendChild(this.div);
	    bar.subbars.push(this);
	}

	extend =()=> {
		var focussubbar = this;
		this.bar.subbars.map(function(subbar){
			if(subbar==focussubbar){
				subbar._extend();
				subbar.div.addEventListener("click", subbar.retract);
				subbar.div.removeEventListener("click", subbar.extend);
			}
			else {
				subbar._hide();
				subbar.div.removeEventListener("click", subbar.extend);
			}
		});
	}

	retract =()=> {
		var focussubbar = this;
		this.bar.subbars.map(function(subbar){
			if(subbar==focussubbar){
				subbar._retract();
				subbar.div.removeEventListener("click", subbar.retract);
				subbar.div.addEventListener("click", subbar.extend);
			}
			else {
				subbar._show();
				subbar.div.addEventListener("click", subbar.extend);
			}
		});
	}

	_retract =()=> {
		this.div.classList.remove("extend");
        this.div.classList.add("retract");
	}

	_extend =()=> {
		this.div.classList.remove("retract");
		this.div.classList.remove("show");
        this.div.classList.add("extend");
	}

	_hide =()=> {
		this.div.classList.remove("retract");
		this.div.classList.remove("show");
		this.div.classList.add("hide");
	}

	_show =()=> {
		this.div.classList.remove("hide");
		this.div.classList.add("show");
	}
}
