if(Intl.NumberFormat.prototype.formatToParts === undefined)
{
	Intl.NumberFormat.prototype.formatToParts = function(number)
	{
		let sample = getSample(this);
		let decimalSymbol = findDecimalSymbol(sample);
		let groupSymbol = findGroupSymbol(sample);
		let parts = [];

		let str = this.format(number);
		let inFraction = false;
		let inNumber = false;

		for(let i = 0; i < str.length; i++)
		{
			let ch = str[i];
		
			if(ch == '-')
			{
				inNumber = true;
				parts.push({ type: "minusSign", value: "-" });
			}
			else if(ch >= '0' && ch <= '9')
			{
				inNumber = true;
			
				if(inFraction)
				{
					parts.push({ type: "fraction", value: ch });
				}
				else
				{
					parts.push({ type: "integer", value: ch });
				}
			}
			else if(ch == decimalSymbol)
			{
				inFraction = true;
				parts.push({ type: "decimal", value: ch });
			}
			else if(ch == groupSymbol)
			{
				parts.push({ type: "group", value: ch });
			}
			else if([",", ".", " ", String.fromCharCode(160), String.fromCharCode(8239)].indexOf(ch) != -1)
			{
				parts.push({ type: "literal", value: ch });
			}
			else
			{
				parts.push({ type: "currency", value: ch });
			}
		}

		let last = parts[0];
		let normalized = [ last ];

		for(let i = 1; i < parts.length; i++)
		{
			let part = parts[i];
		
			if(last.type == part.type || (last.type == "currency" && part.type == "literal" && part.value == "."))
			{
				last.value += part.value;
			}
			else
			{
				last = part;
				normalized.push(last);
			}
		}

		return normalized;
	}

	function getSample(numberFormat)
	{
		let options = numberFormat.resolvedOptions();

		let sampleFormat = new Intl.NumberFormat(options.locale);

		return sampleFormat.format(-1234567.89);
	}

	function findGroupSymbol(sample)
	{
		for(let i = 0; i < sample.length; i++)
		{
			let ch = sample[i];
		
			if([ ".", ",", " ", String.fromCharCode(8239)].indexOf(ch) != -1)
			{
				return ch;
			}
		}

		return null;
	}

	function findDecimalSymbol(sample)
	{
		let indexComma = sample.lastIndexOf(",");
		let indexDot = sample.lastIndexOf(".");

		if(indexComma > indexDot)
		{
			return ",";
		}
		else
		{
			return ".";
		}
	}
}