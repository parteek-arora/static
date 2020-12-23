    //get the checkout details
   
	var node = document.createElement('script');
	var toInject = `(
		 {{ inject "checkoutId" checkout.id }};
    		 {{ inject "countryCode" settings.country_code }}
		 var jsContext = JSON.parse({{jsContext}});
	)();`;

	node.innerText = toInject ;
	document.querySelector('head').appendChild(node);

    
    
    var ckboxID = "sameAsBilling";
    var checkoutButtonID = "#checkout-shipping-continue";
    var customerContinueBtn = "checkout-customer-continue";
    var cssToHideShipping = '.checkout-step--shipping { display: none; }';
    var defaultShippingAddress = {
        "firstName": "Jane",
        "lastName": "Doe",
        "address1": "Static Address",
        "city": "Test",
        "stateOrProvinceCode":"MH",
        "postalCode": "12345",
        "countryCode": jsContext.countryCode,
    };
    var isNeedToClick = 1;

    //Logic to update the shipping address.
	var checkoutId = jsContext.checkoutId;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", `/api/storefront/checkouts/${checkoutId}`, true);
    xhr.send();
    xhr.onload = function() {
        if (xhr.status == 200) {
            var checkoutDetails = JSON.parse(xhr.response);
            var lineItems = checkoutDetails.cart.lineItems.physicalItems;
            var items = [];
            for (var i = 0; i < lineItems.length; i++) {
                items.push({
                    "itemId": lineItems[i]["id"],
                    "quantity": lineItems[i]["quantity"]
                })
            }
            //hit the api to add shipping address
            var shippingXHR = new XMLHttpRequest();
            shippingXHR.open("POST", `/api/storefront/checkouts/${checkoutId}/consignments?include=consignments.availableShippingOptions`, true);
            var deaultAddress = [{
                "shippingAddress": defaultShippingAddress,
                "lineItems": items
            }];
            shippingXHR.send(JSON.stringify(deaultAddress));
            shippingXHR.onload = function() {
                if (shippingXHR.status == 200) {
                    var checkoutDetailUpdated = JSON.parse(shippingXHR.response);
                    var availableShippingOptions = checkoutDetailUpdated["consignments"][0]["availableShippingOptions"];
                    if(availableShippingOptions && availableShippingOptions.length > 0){
                        var consignmentID = checkoutDetailUpdated["consignments"][0]["id"];
                        var shippingOptionID = availableShippingOptions[0]["id"];
                        // hit the api to update the shipping option
                        var shippingOptionXHR = new XMLHttpRequest();
                        var shippingOption = {
                            "shippingOptionId": shippingOptionID
                        };
                        shippingOptionXHR.open("PUT", `/api/storefront/checkouts/${checkoutId}/consignments/${consignmentID}`, true);
                        shippingOptionXHR.send(JSON.stringify(shippingOption));
                        shippingOptionXHR.onload = function() {
                            if (shippingOptionXHR.status == 200) {
                                //console.log("Shipping Option Update successfully")
                            } else {
                                console.log("error in selecting hipping option.");
                            }
                        }
                        shippingOptionXHR.onerror = function() {
                            console.log(`Error in adding the option`)
                        };
                    }else{
                    	alert("Shipping option is not available")
                    }
                    
                } else {
                    console.log("error in adding shipping address.");
                }
            }
            shippingXHR.onerror = function() {
                console.log(`Error in adding the shipping details`)
            };
        } else {
            console.log("error in fetching checkout of order");
        }
    };
    xhr.onerror = function() {
        console.log(`Error in fetching the checkout details`)
    };

   
    var newStylesheet = document.createElement('style');
    newStylesheet.textContent = cssToHideShipping;
    document.head.appendChild(newStylesheet);


    //init mutation to check the dynamic created element.
    
    (function(win) {
        'use strict';
        var listeners = [],
            doc = win.document,
            MutationObserver = win.MutationObserver || win.WebKitMutationObserver,
            observer;

        function ready(selector, fn) {
            listeners.push({
                selector: selector,
                fn: fn
            });
            if (!observer) {
                observer = new MutationObserver(check);
                observer.observe(doc.documentElement, {
                    childList: true,
                    subtree: true
                });
            }
            check();
        }

        function check() {
            for (var i = 0, len = listeners.length, listener, elements; i < len; i++) {
                listener = listeners[i];
                elements = doc.querySelectorAll(listener.selector);
                for (var j = 0, jLen = elements.length, element; j < jLen; j++) {
                    element = elements[j];
                    if (!element.ready) {
                        element.ready = true;
                        listener.fn.call(element, element);
                    }
                }
            }
        }
        win.ready = ready;
    })(this);

    //Auto click the element when created.
    document.addEventListener('click', function(e) {
        if (e.target && e.target.id == customerContinueBtn && isNeedToClick == 1) {
            ready(checkoutButtonID, function(element) {
                var ckBox = document.getElementById(ckboxID);
                if (ckBox && ckBox.value == "true") {
                    var ckboxLabel = document.querySelector("label[for=" + ckboxID + "]");
                    ckboxLabel.click()
                }
                element.click();
                isNeedToClick = 0;
            });
        }
    });

