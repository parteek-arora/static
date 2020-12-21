console.log("this is to test the static content");
{{inject "checkoutId" checkout.id}};

var jsContext = JSON.parse({{jsContext}});
var checkoutId = jsContext.checkoutId;
console.log(jsContext)
