

function csvToJSON(csv) {
    var lines = csv.split("\n");
    var result = [];
    var headers;
    headers = lines[0].split(",");

    for (var i = 1; i < lines.length; i++) {
        var obj = {};

        if(lines[i] == undefined || lines[i].trim() == "") {
            continue;
        }

        var words = lines[i].split(",");
        for(var j = 0; j < words.length; j++) {
            obj[headers[j].trim()] = words[j];
        }
        result.push(obj);
    }
   return result;
}

$(document).ready(function() { 
    console.log("ready")
    const myForm = document.getElementById("myForm");
    const csvFile = document.getElementById("csvFile");
    myForm.addEventListener("submit", function (e) {
       e.preventDefault();
       const input = csvFile.files[0];
       const reader = new FileReader();
       reader.onload = function (e) {
          const text = e.target.result;
        //   document.write(text);
          output = csvToJSON(text);
          console.log(output);
          alert("上傳成功");
       };
       reader.readAsText(input);
    });
    

    
  
 });
 $('#generate-report').click(function () {
  
    // var userData = output[0];
    var pdfListItems = [];
    for(userData of output){
        console.log("user 1");
        var formattingProduct = getProductData(userData);
        console.log("format:", formattingProduct)
        // console.log(getFormattingProduct);
        var orderData = getBillData(formattingProduct.productData, formattingProduct.productPrice);
    
        var emailEntry = userData["Email"];
        var nameEntry = userData["暱稱"];
        var digit3Entry = userData["手機末三碼"];
        var rsvpName = userData["喜帖收件人"];
        var rsvpAddr = userData["喜帖寄送地址"];
    
        var data = generatePdfContext(emailEntry, nameEntry, digit3Entry, rsvpName, rsvpAddr, orderData);
    
        pdfDocument = buildPdf(data);
        downloadPdf(pdfDocument, emailEntry);

    }

});


function pdfHeader(title){
    return  { 
        alignment: 'center',
        text: `MobReiWedding#${title} Details`,
        style: 'header',
        fontSize: 23,
        bold: true,
        margin: [0, 10],
    }
}
function getToday(){
    var date = new Date();
    // use the toLocaleString() method to display the date in different timezones
    // const taipeiTime = date.toLocaleString("en-US", {timeZone: "Asia/Taipei"});
    const taipeiTime = date.toLocaleDateString("zh-Hans-CN", {timeZone: "Asia/Taipei"});
    return taipeiTime;
}

function getBase64ImageFromURL(url) {
    return new Promise((resolve, reject) => {
      var img = new Image();
      img.setAttribute("crossOrigin", "anonymous");
  
      img.onload = () => {
        var canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
  
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
  
        var dataURL = canvas.toDataURL("image/png");
  
        resolve(dataURL);
      };
  
      img.onerror = error => {
        reject(error);
      };
  
      img.src = url;
    });
 }


function generateUlItem(key, value){
    return {
		italics: false,
		ul: [
            {text: key+ "\n"},
            [
                {
                    text:  value+ "\n"
                },
            ]
        ],
        text:  [{text: value+ "\n"}],
	}

}

function generateSection(title){
    return {
		italics: false,
		text: [
			{text: title + "\n", style: 'invoiceBillingTitle'}
		]
	}
}

function getProductData(row){
    var mapping = { 
         "壓克力立繪": {
           "title": "壓克力立繪",
           "price": 450,
         },
         "大禮包":{
            "title": "包在我身上方案",
            "price": 1010}, 
         "御守":{
            "title": "一且唯一雙面PU布御守",
            "price": 120}, 
         "貼紙":{
            "title": "師弟旅行到處貼貼",
            "price": 60}, 
         "飲料杯帶":{
            "title": "蜜月帶著走杯套",
            "price": 150}, 
         "透明書籤":{
            "title": "透明書籤",
            "price": 100},
         "b5托特袋": {
            "title": "幸福99帆布手提袋",
            "price": 200}
    }
    
    var productPrice = row["最終價格"]
    var productData = {}
    for (var property in mapping){
        dictMap = mapping[property]
        productData[property] = {
            title: dictMap["title"],
            price: dictMap["price"],
            quantity: row[property],
            amount: dictMap["price"] * row[property]
        }
    }
    return {
        productData: productData,
        productPrice: productPrice
    }
}
function getBillData(product_data, productPrice){
    var refreshTable = [];
    var calculated= 0;
    for (var property in product_data){
        var obj = product_data[property];
        if(parseInt(obj.quantity)){
            var amount = obj.quantity * obj.price;
            calculated += amount;
            refreshTable.push({'項目': obj.title, '單價':obj.price, '數量':obj.quantity, '總價': amount })
        }
    }
    if(calculated!==(productPrice-1125)) console.log("price not matched");
    return {
        billData: refreshTable,
        total: productPrice,
    };
}

function openPdf(pdfDoc){
    pdfMake.createPdf(pdfDoc).open();
    // pdfMake.createPdf(pdfDoc).open({}, window);
}

function downloadPdf(pdfDoc ,receiver){
    pdfMake.createPdf(pdfDoc).download("MobRei Wedding " + receiver + "#details.pdf");
}

// PDF: Default Styling
function buildPdf(data) {
    
    pdfMake.fonts = {
        Roboto: {
          normal: 'Roboto-Regular.ttf',
          bold: 'Roboto-Medium.ttf',
          italics: 'Roboto-Italic.ttf',
          bolditalics: 'Roboto-Italic.ttf'
        },
        AaGuDianKeBenSong: {
          normal: 'AaGuDianKeBenSong.ttf',
          bold: 'AaGuDianKeBenSong.ttf',
          italics: 'AaGuDianKeBenSong.ttf',
          bolditalics: 'AaGuDianKeBenSong.ttf'
        },
         characters: {
            normal: 'characters.ttf',
            bold: 'characters.ttf',
            italics: 'characters.ttf',
            bolditalics: 'characters.ttf'
         },
          
      };
    var docDefinition = {
      info: {
        title: 'MobReiWedding Ref#' + data.id,
        author: 'One And Only One',
        subject: 'MobRei wedding Register Form',
        keywords: 'MobRei Wedding',
    },
      content: data.context,
      defaultStyle: {
        font: 'characters',
        fontSize: 11,
        color: '#595553',
        lineHeight: 1.2,
        columnGap: 20,
      },
      styles: {
        header: {
          fontSize: 18,
          bold: true
        },
        itemTitle: {
          fontSize: 12,
        },
        itemContext:{
          color: '#595553'
        },
        "p": {
          "marginTop": 11
        },
        "ul": {
          "marginTop": 11
        },
        "ol": {
          "marginTop": 11
        },
        "h1": {
          "marginTop": 36,
          "fontSize": 36
        },
        "h2": {
          "fontSize": 24,
          "marginTop": 10
        },
        "h3": {
          "fontSize": 20,
          "bold": true,
          "italics": true,
          "marginTop": 10
        },
        "h4": {
            "fontSize": 12,
            "bold": true,
            "marginTop": 10
          },
          // Document Header
	    documentHeaderLeft: {
	        fontSize: 10,
	        margin: [5,5,5,5],
	        alignment:'left',
            bold: true
	    },
	    documentHeaderCenter: {
	        fontSize: 10,
	        margin: [5,5,5,5],
	        alignment:'center',
            bold: true
	    },
	    documentHeaderRight: {
	        fontSize: 10,
	        margin: [5,5,5,5],
	        alignment:'right',
            bold: true
	    },
	    // Document Footer
	    documentFooterLeft: {
	        fontSize: 10,
	        margin: [5,5,5,5],
	        alignment:'left'
	    },
	    documentFooterCenter: {
	        fontSize: 10,
	        margin: [5,5,5,5],
	        alignment:'center'
	    },
	    documentFooterRight: {
	        fontSize: 10,
	        margin: [5,5,5,5],
	        alignment:'right'
	    },
	    // Invoice Title
		invoiceTitle: {
			fontSize: 22,
			bold: true,
			alignment:'right',
			margin:[0,0,0,15],
            bold: true
		},
		// Invoice Details
		invoiceSubTitle: {
			fontSize: 10,
			alignment:'right',
            color: '#aaacaa'
		},
		invoiceSubValue: {
			fontSize: 10,
			alignment:'right',
            color: '#aaacaa'
		},
		// Billing Headers
		invoiceBillingTitle: {
			fontSize: 12,
			bold: true,
			alignment:'left',
			margin:[0,20,0,5],
            bold: true
		},
		// Billing Details
		invoiceBillingDetails: {
			alignment:'left',
            fontSize: 10,
            color: 'gray',

		},
		invoiceBillingAddressTitle: {
		    margin: [0,7,0,3],
            fontSize: 12,
		    bold: true
		},
		invoiceBillingAddress: {
            fontSize: 10,
            color: 'gray'
		},
		// Items Header
		itemsHeader: {
		    margin: [0,5,0,5],
		    bold: true,
            fontSize: 12
		},
		// Item Title
		itemTitle: {
		    bold: true,
            fontSize: 11
		},
		itemSubTitle: {
            italics: true,
            fontSize: 10
		},
		itemNumber: {
		    margin: [0,5,0,5],
		    alignment: 'center',
		},
		itemTotal: {
		    margin: [0,5,0,5],
		    bold: true,
		    alignment: 'center',
		},
		// Items Footer (Subtotal, Total, Tax, etc)
		itemsFooterSubTitle: {
		    margin: [0,5,0,5],
		    bold: true,
            fontSize: 10,
		    alignment:'right',
		},
		itemsFooterSubValue: {
		    margin: [0,5,0,5],
		    bold: true,
            fontSize: 10,
		    alignment:'center',
		},
		itemsFooterTotalTitle: {
		    margin: [0,5,0,5],
		    bold: true,
            fontSize: 10,
		    alignment:'right',
		},
		itemsFooterTotalValue: {
		    margin: [0,5,0,5],
		    bold: true,
            fontSize: 10,
		    alignment:'center',
		},
		signaturePlaceholder: {
		    margin: [0,70,0,0],   
		},
		signatureName: {
		    bold: true,
		    alignment:'center',
		},
		signatureJobTitle: {
		    italics: true,
		    fontSize: 10,
		    alignment:'center',
		},
		notesTitle: {
		  fontSize: 10,
		  bold: true,  
		  margin: [0,50,0,3],
		},
		notesText: {
		  fontSize: 10
		},
		center: {
		    alignment:'center',
		},
      }
      
      
  };
  return docDefinition;
}
// PDF: Align Each Section Content
function generatePdfContext(emailEntry, nameEntry, digit3Entry, rsvpName, rsvpAddr, orderData){
    // var emailEntry = document.getElementById('Widget658159440').value;
    // var nameEntry = document.getElementById('Widget1439048663').value;
    // var digit3Entry = document.getElementById('Widget981692748').value;
    // var rsvpName = document.getElementById('Widget111610196').value;
    // var rsvpAddr = document.getElementById('Widget896231682').value;
    console.log(emailEntry, nameEntry, digit3Entry, rsvpAddr, rsvpName, orderData);
    var bill_col_data = ['項目', '單價', '數量', '總價'];
    
    // get bill header 
    var billHeaderContext = generatePdfBillHeader(rsvpName, rsvpAddr);
    console.log("billHeaderCibtext:",billHeaderContext );
    // get bill data
    // var orderData = getBillData();
    var registerFee = parseInt(orderData.total)-1125;
    var billTable = buildPdfTable(orderData, bill_col_data);
    var billTableFooter = buildPdfTableFooter(registerFee, 1125,  orderData.total);

    // footer note
    var footerNote = buildPdfNote();
    var context = [
        generatePdfTitle(),
        generatePdfHeader(emailEntry, nameEntry, digit3Entry), 
        ...billHeaderContext,
        '\n\n',
        generateSection('茶會報名明細如下：', ''), 
        billTable,
        billTableFooter,
        ...footerNote,
        ];
    return {context: context, id: digit3Entry};
}

// Compress ->  png -> To Datauri
// https://processing.compress-or-die.com/png-process
// https://svgtopng.com/
// https://base64.guru/converter/encode/image/png
function returnLogoDabaseUri(){
    return `data:image/png;base64,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AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACA/98eHAgAAAAACPK3HmCFCgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAmiK5znM/zE8cAAAAASUVORK5CYII=`;
}

function returnTitleStandardBlonde(){
    return `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABDgAAADSCAYAAACvgHB4AAAABmJLR0QA/wD/AP+gvaeTAABrQ0lEQVR42u29CZgc1Xnu75v/vfdv+97cOI7jXMfXIU4cx9fO5iWx49g4jvct3rAdOxBjFiGk6dm6WyPN2iONhED7rkFCYtPsI3YMGKwgzSJAbGYXGBCITUhsAiG03u89dU73qeqqnq7ee/T+nqcexHR3dVV1Lef7zvu939veRgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEJIBhbPb7tl2YKOQR4JQgghhBBCCCGEVCUblnf+9Bdnx443NM48xKNBCCGEEEIIIYSQquS8Oa33I8Fxwby27TwahBBCCCGEEEIIqTrWr0+8e+r0+LEzpsSPX7Qq8dXJtn9bNibevnJJ++qu2a2PnT+3/Y6enrl/xF+dEEIIIYQQQgiZZCxf1LEO6o3WluaXJ9u+rVuV+EE8PvNN7J9ZLpjXejt/dUIIIYQQQgghZJIRnzHzAAL/FYs7Vkym/cL+nHVOXCU1GhqaDi1Z0H41/j1z5qzX+KsTQgghhBBCCCGTiO6l7VEE/ZG6GUdWrUr8z8myX4sv6LgOJTfYN5SlbFyy5F1Lzm+/Hv8/t7Plt/zlCSGEEEIIIYSQSUR7a/MeBP2Lzm+7abLskxil7sA+nTUVqpTEevwN3iJTzoXPSOx497LEWfzlCSGEEEIIIYSQScK6lYlvQuUw5dzY8Y1r5/zFZNgnSdT8GsmNKVPjSGTMwN/Wr+06ua6h6bDuErODvzwhhBBCCCGEEDKJOK+r7QEE/WgROxn2Z+nC9j6l3BDfjTXLEgn8bePqrs/U6+SGmKjuu/zyxP/iL08IIYQQQgghhEwSLu5u/XMp2TgOBcf61Z3fqvb9WbU0sRDlJyhLWb000Yy/da/s/HmktukIkhvNs5pfvXRN4r385QkhhBBCCCGEkEnEovltNyPwb29rfr7a92Xjqjlfnzotfgz7s3xh4nL8bcWixHKU3ph97Ole+B7+6oQQQgghhBBCyCQC3VJqapuOIvhHF5Vyb08+yoqenrl/FI01HVTdUrpa78a+4b/4f1V+09V635aNibfzVyeEEEIIIYQQQiYZyxd1rEPwH4/POlDodV+2ZO771i5NdC5f1HaJlL78aKL3S+vWG1AmYzwzwjI70fKU9tfYC9PUpqZZbyiTUemYsmJxxwr+2oQQQgghhBBCyCTgolWdX4SKobm5+dWuRMsT8KVAYkOVc0iio1DfA+UEOpiYUhGzXHBe+3jQZ9YtT5wCzwx4Z6xb0fkL12trO79y/rz222AMunpJYr7f51cuaV+N76itbzoiiZJrz9HfHRNFB5Id/PUJIYQQQgghhJAyk6nbB5IJKM3I9PlEIvE7Sxa0X218KLxLTWTG0UJ1FFm3ru2TRjmBZEVba/OeubPbHkarVvxtw/LOn3o/092deGd8xkyVaJk/r+0u83eYn87tan0Q6zHbKiUn96R/55wPmjIbYySKpauz9TH6bRBCCCGEEEIIIRUASjuQHFg4v32b/XejkkDSIlI348iWLYn/GrQOJA2chEP8OBIG3ctn1y44r20kmTSY23pnQbZ1ZfuXsC1YZ33jzEMXrkycYV6bN7vlEdv40wb7gdcaGpsOmYTEyiWJtdMk8WInYqA2WbOm6/3ez2OfXAmb2hlHRemxINvtxnvPn9t+B44pzzhCCCGEEEIIIaQIzJnd8jiC9oXz27aYv21Ym/ioqCReNwE9FBNBn0diRPtQHF+7rHNWMqhf3H6B+fy6VYkf5Ludl6yZ/fH6hqbDZp3ehMzsRPMu/B2lJPbfkcAxpSndyzqnr1+feLckQx7yqkyQONmwtO3T3u+VspuzjcJDJXBELbJ+ZctJ2W43SnPOnOK0yEUJD884QgghhBBCCCGkwGzsnveRs86JO74UUvqhEgJru06ORme+ZQJ/BOYXrmiP+H1+zbL2NryOddjJDXQSMetomjHz9Xy3E8qHmTNnvWa2B/9durC9z7yOEhSUkOC1jau7PmN/VjxB7lX+HPPadqxfPed7pgvKudPjxxpjzjbCy0MSId/y++6W5lkvGcVI2C4wKxYnNpjkiJTwXMkzjhBCCCGEEEIImQD4SaAUAkH4QCLx37P5zKL5bTcj+EZ3EPw/FAYov7CVDfCZ8PssVB7T9XuXLmwbdgX2CzouM59ftqCjP999k+TEGNaFpIlRjJhtBisXd3Tjb0iCmL/B8yPR0fyMlKdc19nW8ixKV4xPBxQpUFYg+YCkSFC5CZQneP80SYb4la5kAp1dzPqXLmjf7PeetSsSp0qpzEqevYQQQgghhBBCiAAvCmOCaQL49WsSf7X0/LYrEGj7fQYqC+NngdKNdavn/k1DQ9Mho2gw7U+xHr/Pz+tqewDvaW9tfhEmo+bvl65JvNfeFq+iIiwoMUGi4ExRiaxf2XkaSlVQDoN1z+lsfRIJHaPKQAcX6XByfWdH69PLFiY2OC1dZ+2FesNsz9zOlt8iGWT2VUxF7w76bpSj+JXDTIS0oe0yZSne5I9hxcKONVC+KGNUn9IYQgghhBBCCCHkhAIlJUZJ0dLS/FKDlFLg33XarwK+FX6fW72kY4ltrGm6jEir1JdNl5KgtquXrer67NniawFviw3L275gv7Z4ftstJpmAEpB896+9reUFlYiQNq7JbV+eaD3H0yLWLqlZsSQxe7oYiHYmWnctX9imlRqxpJJCTE/H8d4Z8ZkHgow/pezlPWtkPVCF4Bhnu71ojWsSMIsv6LjO+zqSQQvPa7/VlNogiZSt4oYQQgghhBBCCJmUIDCWAHy/U7LRvAudTqBOqLPMOLsSLU/4fbZ51qxXTAkJkhr4dyw+683uZYkZxjQUHh1+n11yftv18N+QZMaNrmSLdDkxZSBaUXFvPvvX3d31OSQCpkqJCPbLfg3bJmUqT5ikhpSvHETLWKhWNnQnPrF2WWKe8c9AiUn38kS9+tyqxN+dPdV4iySm+X3vmmWdHTguSIp4EzgTba9Rr5w3p/V+7+som+nS22yW9rbm5wt5TuC4oBwH3yO/6z4YqhbC5JUQQgghhBBCCHGxbkXnL8QX4ia0LjVBd65AIZBsf9oz94/M35cvbO8xAbSfx8O65YlTjNGmlHM847Q+bTqKchJTloG2pn7feeGyxGcd082mQ97XJMGw1w7e4XORz/6h3CQoUQIPEKNWQZva5N+Xd/60xmr/CgXLxlVzvm5eXzCvbav28EhL/CBhhG4yULN0tjU/a0p9stlWKfl515plHeeLmejVSFp4VRlQgcBwVSWPJAmE9rv4N7rNFOK86rsw8WE5Tr+xE0xmQUJHEldn8eojhBBCCCGEEJI38I6AX4U3+ESyI5f1QYmA8gYoEbqXz641f0cJRKrjiHhgrJ3zF97PmjapJhhWXhsrZv8MLVRN6cf6VZ3f8X7uolWJr3Z1tjymuoKIisN+DZ4SJmkyS38/Skm860BJyOrFHXPwXRPtoylPEU+LhP13+HyYNrazZjbvN2Um+G88PvNN24sE3iL2Z1GWonwvJBHiTfqYdYryYe/qlZ1NouIYhCIkm98D26G7tdzu3TcxMZ0PFYpKuNQ3HUYSxPw7qEQmDKuWdZx37vRUyQ5MVZHYEoXKVPm9HjV/C/o8kjFStnMnzs9CbA8hhBBCCCGEkEkKSjeMoScMPGFsabqB1NY3HcllnUZpMWd2y+P231cuaV9tAt2YmG96P7du3ZwPGvWAKe8wKgK0ejWJAe/noDaBD0Zdw8zDKAWxg/h1KxPfNMakq5YmFkNRodUja+11QHVhykaWXNB21cRJAydRguRL8liKoqJ5VvOrjnJl5iGs07xmjikWbKOtajGYEhKUbaC9rHSOOVsSPo+cqQ0/8XvAuNR0gvHz0XAdz7WdX1kpxw/vPfOc2PELF7WdkdxWOUb4rY3fRkd763PYfpNkWba4/dJ8zisYxeI3Met3fjt3W14kOXSHmf1+68AxQHmTOTfDdoshhBBCCCGEEHKCAKVFvS6laGluftn4WsCvwZiBhl2n403hlB7A8NP8vad74XtMIgULlBrez25YO++jKxYlFsBc1NshxBiEelUlkrRYCLXH0oXtA7OlCwlUDehuota3qusDaN+qv+8R/G3F4o4VJlGC/Uegj2SHSS6gbCQbbwskKVSpy8KOi0ySBQkIldyQLig4DqkkUstJOCaqU4psB4J/v3Wi7a2fOSmO5fw5rfdgPc4+JNYr5UNH89N+60EiAKoHKWn51fRI09Fzp884tn5te1L1snppotl0akG3FHRTgbpGym5uMGVFSC7kel5BadGujw9UNzHdSQbqEPt9MIrN5AkCZYdKbogCBMkeXrGEEEIIIYQQcqImMCRhAVWE32sw/WxudtQGbS0t+2z5P5IIjr9E2wNhvxOeFH7eFFIeMeb2wHC3iJXteTs6riARsGpZYja8IrCN3vUa7wwYe0KNYRQCSHSsXNzRjf+HpwTKX4yaAsoBo+pAogUBvF8iAYamtuoiEyizMKU06Mhi1gFlBxIn3mONhI4oLq7JtE6Ut6DFLXw6kHiQRM+b6KqCEiL7fShtwffiWF24oj2STKSIAgPfYTrXrBbVS1try57uFYkZ6vXVnd8Sf4+n7E4yRoGCEh9TFoQESK7nHEpKkHjBepDQQrIJyRav4kR937lOqZLXaPSyJXPfZ8xla2Rf7Nfh54FzByVCSMAh+TNXJ68IIYQQQgghhExC4NGAIDnqUwoCjNknFBx2EgQBpPFMCDtrjrILdDhB0Gq3L4WJpGmHaoJoOzAHaE/qlFLEj6O0AuoL+3UoM/A6FBmJ9pbnjG8E1mkSB53tLbuNOsME+VAPeL0ukDBAoG8C7ObmWa9A2QEVQ5j9dUownGQBFCDYjiB1RqExCaMzJaEDfw50ajGlLI4iZ9ZLlyzuej/KhVDeAf8Pq/3r8UXz226GSgLrwn6bhIIYuz6d53btMMfDnAPwKTHJivWr53wPCYyoVnUg+eFNBpnEFHxAcC5g+1CiBFWIOd6ubi/yd17xhBBCCCGEEFLFYMYeXTW8fglokZoMdFuaX/JLRJgkhtds08y+5xLoQl3hNY2EYsKUiaDMAkGr8plY1/bJ5H6IuiK5PT6dVYBt3mkSG+iMYs/ur1vZ+d1pVpcSbIe3hWuhgVoDnVC8nUmKDb4PJR5nWUkNJC7wu3WvmNOQTMJIxxnzOhQPC85rG7Fb7GLbJSmx3bwHqhhbORMGdOFBwgVJLNubxDmvnI44Z+qkm0mCwEB17YrEqReuTJyxdtWcU1AqBQ8UnDNQeUCtYUpcvAsSNkiQmEQNIYQQQgghhJAqxagwbIk+uoDYs9ww9vR+TtQd/aY0xfwNygN4IeDv0yTZsHHV7L8Puz2J1ubndZJigfp/mXk3vhJIxGxcsuRdCLJVgkNUFXgdSoTVSzuW4G8SfG/PlJBAUN+9rHO6lIfMCyolgfIDfhgoxzgRzgH4baguM1IKEuSbAVWOrWJZt6rzJ0gMGM8Q79K9svPnuWwLlDBOF5v2a72v4fwyHXK8CxIYa5YmzjtLjFDPkP9HwgPbZ7fUhWdIl7TPNQkdJEdWL29vyrQ9ON9QuoSyHyTHUDKD5AoSX6IqmsE7CCGEEEIIIYRUCOhSYne8gJzfdAwxbVH9Wp4aJQSCP/w/gmPjx4G2rBJgxvySC2hfGlTGgb/j+5BcQQkC/mbKTrBN2Db93W/gbyg5gboE37fkgvY+8fu4B7P4/FWLAzxW0C7XHH/vMqez9ckVC9svXr4wcXkuCg6oifDbB51z61d2nma8SqDimSuGsCiLQfvXDWs7v9s0Y9YbYhK7W/w/5jTNmJlU6sCHBOVDa5Z1dkChYjxVvD4nNkiSLTivddS+FvyWBfPatvLMIIQQQgghhJAKoN6oIaQVKoJS07o02anExyQUM/4oIYD/BBIcbZavAdQVKBnw+y74TeA9CJL9Xoepp5lpR7LDlMmcJSaQa5a1t5n3mW4oZoGKwJR45FoaQYJB+Qa6pNgdbFDGg7IU060G502+ZR5rlyY6tR/Gi97vh9+H8QeZNbN5v60mWb+q8zswtRUT2fvM9mgfldeh1MG5hOSGUW6gbaxfAiWZyJFz2nTEMfsmipLr0ZIWZVG4VtBxB+akKhlndfohhBBCCCGEEFJg0A5UWoFuQPnGqmUd5/mpJjYsbfs0AjiYaeJ1Cdr6jGlokL+GCgBlJn/x+W3XIHg0Rp1IeGDG2ygvvHQvn10LbwUEhUGlH/D1QMCIdZpAFUHt6sXtF9jvQ6kCuml0zW59DMoTfI6/eOFBsggtbI3niVFDwNMCCQJjUorEh9eENRckgTDNmMBi/VintIW90iRWcG5cMK/1djuRAhNbc64my1VkG2FKat4DXw+cd8YfJJOCyCThTPlVkCIIJTumPAeqJJ4thBBCCCGEEFIEupe3nxOpdXsjwBvD+z7I9vFaoqP5GfhlGDm+SXSg9MNvVn65fj0WbToIDw+8HwmVoO2BcafpSLJ0QfvmTNs+d07rTrPN8DpAWQJ/0TKcQ+KhYRuyoiwFXUjM68aDRZmBFug3ggLHlKCcNdVdCoLvh4LCfj/KoHCOmvcgEYKknm3WCrWRSZCgG0ymLjcblrd9AWoN7BP2L+i9UIMY5RM8Q3i2EEIIIYQQQkgRgFzfJCraW1teXDi/7VfGd8BbOiKS/t8oQ0fpONHR3vqcke8jSDSJD+/6VbnCgrZLVHvOrra7sgmUp+kZdnRXmaiNKl7HrDlm80vdVYQ43WjO72q925QcIZAXpc5K+3eDAax53c+ANq/vF3UP/DGU74qcNzCdFTVGl7f0yLQTNv4sUkJyg1/ZCTwyzLWQ6XxaOL/1Fqg8RJ2yEV4yKEGBGS26sKAsBUlD/M329mieNesVu5sMIYQQQgghhJACgdINlBCYrigmKIU3Af4mZR3X2O9ftbhjjZQAXL1wfvs2o9hAMAffDb/3O4Fg+7bupV3NKAtYuTQxH1L9oO1BCcs500xyo/WZoA4dpEKSG9JJxbRfhV8FPFC8Ch4E/abcAyVJZTvXJeEBRQZKVuDdEvQ+Y4iKMhXvaxtXd31GOq2Mdy/tjBt/DtnnLXabYL8FSR8YqTIBRwghhBBCCCFFAuUfSqov5Sl2YIpgDH+HKaQJDjesnv0F/A1dSsTz4KBOaFyH15tnOd1QpBtFsysAllIEeGIgKFy3pPUH8GaACiQtcJTuFPDHMAEh/s3kRmWzeknHEpjGmparfr4SKBEx6iA/89lKRLqs7FVqpPaW5yThthbXAhIzSHycMQVGufHjKxYlelBCJcqUlbg2cCzkvL4XSg4kfBoamw6hFKWrs+VRqEmY2CCEEEIIIYSQIoKEhvEaQNBmS/phxGkMFvE+/HfBvPb/PEMlMTo6kbSAsSPMQ/H+BjEZVbPeouYw67hkzeyPG18PdLRYv7L9S2bWG4EfjEwRQKJ1p5nhRzCMv/HXqWxQxoRgH4vXxNPQvWJOgykJQRlTtXSrgSpl2nT/Vq84Py84r328e+UFn4BaCWomng2EEEIIIYQQUmbghWAHb3YXCWmh+WvlQ9DW8kJ8xswD8DVoa23Zs3xxR//MmbP2e9+PNq34mzEOhQ9BTJcuoCWsCW7RTvPsqemBI/wZVCvOtV0n85epbMRMc9CYega170UnHRhvOsmNlqeqTY2zYW3io+jG0tXZ+hjURGj5unp5e5NJ5ECRZLxoeEYQQgghhBBCSJlpl8QDgjSTsMCsNYI6kd3Pl6TEXjsBgQBvw5o5/yLy/Zf9OkHI3/fpkpYdMGk0ZQlom3npmsR77fciiYH3wEAU6g0EifA24C9S+aAECaoNtO+FX4rfe5DESip1JDkwGcszli5sGza+NTwrCCGEEEIIIaSM9HQvfA9m4KGcWLduzgehnvCT5NeIzwB8Ono3LPoASlLM39EhwhX4Lu6YY7pkJH00pAzFr0sFqU6gXqjTrU79WvfCoBbKHyRAnGRX6+3VUpYSlotWdX4R5ztKtYJULDa4DpD4aWlpfmnO7JbHeTYRQgghhBBCSIFYuyIRc9pWNr9qglOUFUi7z3vQHtP4DRj1BVqwmsQF2sP6rfPCFe0RKDhgQrpuVedPeJQnF0hi4fcXs83Xva17UdKBciZTbrR8YXvPZD8e6BhjrgkYi54/t/0OtEuWRMZiLNIitu+8Oa33tzQ3v2y8SMzx49lECCGEEEIIIQUCZSHGRNT7GoJTYwzpDeYQvK5f3fkjHsETD1Fn3KS66EhbVPM3KDSWL+y4qKa2SbVJhWlt9/LZtSfKMYGPDToDZWoRa64bJDrw/o1LlryLZxMhhBBCCCGEFAgoNRB4iWFkv/c1tMPEa5iFNn9rb2t+3ngq8OidmIg6Yb2jQJj5evfyRD2SZKZdsGqrKka0G7vnfeREOy5bNibe3r20PYpOQXPntO5U3jJdrQ9K29j70EYZr61Z0/V+nkGEEEIIIYQQUgQQfCEoXbG4Y4X99/UrO09ThqORGUdNC1jQ2d6yW2T2x7q7uz7Ho3diAt8W48FhLw2NTYdQvsIjRAghhBBCCCGk5Myf4yg4vF4J6HqCv6PLif13yOov7m79cx65Ext0uzmvq+0BdM1BB5G1yzpnTVYjUUIIIYQQQgghVYDx2ejqTJWcrFiUWI6/nSvtYtevbDmJR4kQQgghhBBCCCEVzWWruj6Ldp5TpsaPo6MKSgxMpwd4LfAIEUIIIYQQQgghpCowPhz2In/7DY8MIYQQQgghhBBCqgZ0f0Drz4bGmYewoKNKIpH4HR4ZQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCKkWRoYb/3XbUOw7x4+/7b/waBBCCCGEEEIIIaUMygea/mR0c+y9uX7+1oHYB3cMNP0ej6Qcy6HYr0aHYsflv/eODcZ/xEQHIYQQQggh5IRhbLDxSyMD0c9tG274s0oJhsavmPmn/GVOHCQgX42gXJZnx4ZiF48Px/8p5Odv1J/fOTIUXbl1IPrRE/E4bumJvkeOwWF9LJxlMHbL9qH4X/AsI4SQCmNkMNo8Ohz7Tzy4Rofjp4cZ/AwM/Oj/Gx2O3jY6FP21rGOD/Pu0bZtm/j6PqsONl8b+x9hQ48fHhmPfl+PbIA/EZTLAuFr+e4csD44OxX8r/31YXt8hx/Aa+feisaH4Gbde2fgBHj1CCKn24DL+GxMMyazvcwgw8Uwo2/NeJPayLfvkWb9uR/eU/3Yi/RaSbPqsCtIHY78cHYwulzHLtzCGSY5lBmPPOL9XvGdsMHbO9ssj/2tSnIODsSZXUK4C8+j5Ic7hbs/nj+L4nJBjZe9xdJYD8toPeLcjhJBKevgNx2f43LBvzHa2SQZsD3g++7JI975djcfCDHbCsuWK+neNDM34lCQqfiYP/nmjg/GrdPLiaMADMZvlPllf/WQZZBFCyAmY4Bj3ubcfw3O3lNuBWXfZlivs7ZBAf3Ouz7xSg/GIJP9nytKJ520u67h9IP6/034LmdzBukeumvG78tx+3vPaS5NhsmFsKPpTz36/ESZBIRNXrd7jIkmT755I17FSb2C//cdqJb+eCSGETICe0fHcsKO/DpHg6E+72Q9Gp1XjscCMlmz/lbJPW6BokaUd+zI2HJ1iFpmFi8uDbr687zI1eB2OvZhHEiOb5TVsx/XXR/5/nq2EEFJNCY7YqM89/TCUekVPCiQSvzO2Of51CUavDUq2y/NsQVUcx+FYhx1gy3b/OMffY6+1/29iEiE1Fopd4lY5xK/asjHx9uof4834orVfu+HJES5BEj/D+vxdt22e9Qcn0jWM60j2+4YMY7RLeacjhJBKe/gNzPhL94An2h5mVscz8HgR9cbV+hDDf5GplwTH9VkmHw4gGYRjNjYQ/8L2q+r+yGe2ZKLlmK6NfUCVqkhNp/r+4diAaxmKdW0ZmPY/ecYSQkjVJDju8tzvt24biH6ymN+JMlFdErkzw3PnVf3f20t9TPCc3DYY+2dlXplFmYxK0vgkaPDcDf97JEuGXsb3ewL5xdb6z54s5yBKolL7Fe8O/Xkx07SOS1fWx1pUHo7qIX7zts2Nf1u9xy/e6XP97JIk2yb571tQAVWLEooQQk4Ytg7M+kNz05bA+vGwRmhy85+e+ny8M9vPKbUElBCDsVWQjpbzGODha7uEK8nqUPybekbnTjzMUHIix2e7SBEvx6yPtAr7tN/gbGQ4/pOAAeXLeNBjn5EEQSJIpJ8nnWh10GRygRIq55yPbkTwAJ8BZcTmKJsecWaw40tl+SGSh5P5WDwwkPjvmC0txXfhHiX3rQ/DvHJsoOHdhepygCSqCkBlvVu2JP5rKYNeqWP/d33PvRszzSp4GIod0rPud+rXTq0mnyd4LNnPV5wjIQPyH+KZI2qCr2Z6Nss58A4diF6pj5v3+fOg8oCS8lFT9ojfupS/sZ2AcZ6HaruOyPKU3C+2QRUpx+gCFVDCN0IWSWKcJ3/fH5ioGYz9m/v5O+OLmcpK9Pfgt9ji81u1mEmHyaDc8EtwyDU0O/Q5jESFOYctxUsmRjZHv+I5Dw9Vo2+H3JO+4ZNcewj3K3VsxV8Nr6PciypbQgipIHZck3inNVi4NvTDczD+H9bD88ysBudK8hfvcZVhyOC2bA+xodjI9uEZ/6cQQYdKgrjrVbfBZZvtxMhkAnXwcr9IWIFKNstBmBtCNVZxgehwNOr45tiLCgpPnWh2DvdQLeN+zKnHjv590YOWgYYPBRzjI2rW1LvoJK3erxesv78SHDzGv1r84Cv6EUi807oTZFjkfv06kmZI7FRBguNpK8GxPvSzabjxM3Z5AEpKzbMESQ38P4xLLUVG2kwzzpWKC7ol0RKQiAm1eI+pBNFtTtIk3u3n1ZFUZ0r5Sfprycma/QHn6veQhMHkR0nusZJ8KoQyAF1TrGt6TujfygnineM9GI9NeM5LS1p1j/H7vcSjrFqecVD4KENe9z48In4tf+wZP8aTHVXomUYIIRUSqMhMheW90Rd6ADcY+0UqmI+fnuXgJuZbqpHDw7dACZ63MJDMP0iKn+47EJPuMnklTiQhhBlVSJtHr4j/Oc9aUuZkwN/Lef2kdY7vgRJL/n6KDG7/CslCJDH07NdlehbeE4RHW01ZWGXskzOzG7DscbpfROsQUI4Px76sBv2SFJG/D1tJnichpy/F9iIhXEzvHxm0/6qYM5II3uD/4JkdPYrjiWMMU0wo+6Cuw3HHrKlPAuZ5ee1rFZ7gsBMPjTkkst7t89vcq3019usSx53aC+tSrYiw37+6Uo8NAm/Z7hUyMTLLMehu/CyecwiQofKYaEGXMp/xyL9Z+/4s/t+oJPHstALvZ/Fd5nMITK3S1GNIYphEklF02gkZHG+MHYo6NnPakh7UariHMRGjPcLWowuKMv8UlQuUEUiwQsEjytLv4P6E8QzGC8pc1ilxNcfkTihHszm+SmmjkhXRPrvEKpMSD/4ccl3elPneEm2o9Gec2o/0e85jQRNhOI9NK91qLschhJDyJyacAWKNKneAiZQEFhgQhpWcIhudj4LDbkGWjXxRyyXfyiA5TZTyOJqSknwfuhg0eAzM7OUQjlO2Kg4EFvD00DPktzpeH65j9AwSS7wKSKnBAFoNulNB5sKJvGH0Nb/bZ/b1er8gpeT3Utn+PGeTD4tEeUkpPXKsAXXhF2n9Xcx9QdCkgzV3Z4bh6MlBn0GQivIFX8VKhfoloBzFHdjlNvMPhWO691Osa2Qw/nnvjDEUUrbiI9eOI1V8f/p0kU2/XerMYpclBHS5q/blkCnxqESgjPIxB344U+mTkwSLrjTXZylMhAkhZNKiZ3H8HiAItB9VppVyo8ZsnGoRpzL58W51I1ZeEMo86XZ7Bk3NxOr614mX+BxP66y96m8B79ff9+zEstPoT0t2DIdjY2ZGB7OvKCeRB9z7sxkY4qGGWSEli82umwrqyM8cv2Lmn9rrwPc5bvdy7JyExpvZyXPj03kVkNIN/Gb8A1oM5mLyp+W+e30SmteWW8mhlSa5DdZF6o4yi5Lf+4didxQj+IDZcTG7JCCh5bPth7It6wkw/Dvq9WKoBLYO17/P3k5bMRDyt37KUlnej8mMDAFxxFJ6xE+0exSerV71FcY/zhhIlZDZr92TfM0ZBxxzdRvRr2HBdeF3vUCFUsz9UWMMSSJ7tu2IGeNh/ObsW/QaY0iuFB4yzpNrZY3jf+QqFzmikqNJjxOlojqAcZxKIPqN2TChYl+r4uWS/RgxfZHnxs/L4f2SDSgJwj3d8zvfAa+6rH4rV4Ixek0hSp8JIeQEDDga3u8e/EyWJbqxNEGCGLilvne/POCvTu9eIuaJSn4fmy+BUDNUKsqszRnwvJZjUPQ8HNuVEZdSfqjt8KuFv0cPzLYGrOuNbB68hOSLU8qm/BuSM1ph68P9W1KrhGZdWRMcziA/zDWMsooboLIq033/HT5lP8fVPcTPfyPdjyPA7yL6BJ4pRU7MXJmvas/j35T05RjfPOP/VtI1o0oKrZakuSby5LP3WQH1J7JO1kkJw4l2n/J4ij1jl1MgqLbKDm5MO85OIkGdS14jW90q9C7rfHsOCaRSeWshUMZYIRePB1cXFBnT+CQNF2dKhtllPzD6naznjvqNh2Mb3PeW+M2icv7drK95MX5O71YUP7eSyjEJIaQqwIyFCsyH4uMik/6lGvwhIBcJq1MjLrWZUi+u6jJF0opBl1rgwI+bsfPe5M1Y6mC/pPweslgwowtneOthMD4y1PSxbD/vt5Sqxzp6wdvqE+x3tp/Vs9HHTVcU14LaWE/2X6lknLrURQiK/AJDv5lJGXT8WH2fSCMzyMnn8iogRb9epE7eI8/uyDFY80vWvVDsevYJtslu5blLq9r2ekoCHlJ+GzJD7m0vWfJ7vm0a6CjHTg1z/HRt/05v0hXqtaIeZ6sbg20wHbaMQnX+8lPMSbvGSrpmbHNG+GbkkYBLlvNMlIBytX2XZ9FE61Yz1qIImUwm2Fby77r05yzGSuq1ZT6fO1s/13/ru97hWK/phlNNLdsxtrGSmBf5XJeDUNIFdXSDz43ls7ZuMj7fVPIL3YrcidfBMCVIqtRRnyN+k1Wl8mcihBCiBk9NH7NuwjeGH7RGl4dtIVZunNa48d/YAUyYDLtprQuzVL+2fx45aW12gxDlKu+d2VQ+Gxk6JuyCJ0Kxj9eOa6a8c3TT9JO29U3/8LZNtZ/EDHLGc6qn9sfjvZHTR/vqpuUiRb21d9oHxvtqzh/rjfxytD9yxWhfbeOOgSk5tcHc2jv9S+ODNd/YtinyH6N9Nb8Y76v/wdjAtA/xys8eXBu6/WveZWSu2cQKMJ7TZnLG6PJJO1GAwW0lzrw5HV/U9u5Dkjq3ZIPLCPDl0YH43xU9gPAzCs1RrZfsXJDWpSH+7YoJLB1z1MCZ8+wD9uivzXomaqmuTcOPZtu1Rd53oZmcKHfiLuvrVQWR0V8HTUqkJi7iV2RIcCwKTnDEHg74HTbq16+spvu3Z2xxmf0azicrIXSHX4crV4JDgv7J9nxTXjlI8rjHXreEUShC8aNLwidQ/8VvxsQgRxWEEFL0QZjVI13KIcIPvswAqTpqfjF7qVzo3Q+eW80gPBsJqKu0RWYSYTBoz6zZEnAjv0cnFcx6w9Xcd8Du4wMAE1knoSJO6O7XUHf742LXsY5d2fDXo32Rp0b763ePDjTskQHlKyP99a+P9E2rCXzQ90fOGB1ofGu0v+7Fsb7IyG2XTM9akaMC6f7alaO9kVdluWWst3b2SF/tcvn3Y2P9dU+P9dacGWb71exkb+Q/R/rqXhobqH9FkiXbJFnyoPztpdH+2l9v2Zi7Ad9Ib80fB854SQJlMklSYf7oM1D7YU7Xn2PoedBn8Hd7mfbtFOt6W1AVv4cZjOfYnQn3DisJ+8bIQPRzJQj2v+ab2MqxPbhOTB3wWeetlfM7OSUPWto/O+d7jVOmmFWCQ58fz+gEx5aMv4mlMDEJs3KVXWUD7rfp3Y6iF3kT7qZs1288k1KQxbszJM2e9lO06E41WO+mqrp/W+MV7EPQOWrKc9AON+jazWWMWNHjQTyPfLzs4F+S7TqQCNfeaWEMav8Tk1MsXSGEkCKBwW0+El9bkodazop+mDmzW7enPcx0Rt2ps1XKjn06Gz+EgRBme2SG+TxtkNUOObfPQ2vUGkQd9KpaUMeZHFzJIA0z2XaCwpqVtR6C8RmuJJQMXEuh2HD9vr2Rb0kyYMNYX90WSXQ8orajry4wiJDEhpi1ReU9tUtDf1df5NLRgboX5L9fdf1umP3tEyXHQN1Lo721oYO6EbXttY+kvqe2ZXSw8dhob11Pzselr/bhkf7I1d4BymhP3Q/ltX2j/TWnTpp7BM75dDPK9TkfO3+DzCM7Bpp+r9T75hjxJcu9Tq6OgEUFcHfkMjjWRrEHUuaesW+VKCmzKsB/JWeD1gA5+DF0BquI38ndnvPUoGQTfA0yzepCWZlcz+bYv2T6TtXaM+UN9WqQR5P273rB5/i9Wiw1j/a6uRRmlnguojUsrjmcA2iHm6lMRnWpGI6tDWhpPGL7JFheQS7TdP15k9h7U21P6rXZeO5b6x1ymWM6Zp1a6RDtq6b7tzrOPgoO3TbXr3vUIft89HSmuXSyPNeUr4m7PNHVGQv3F5QOY6JJJYXlXEV5t5yrf21KquH7IxNcmzMkM47o52eL1U7c1Z0F10I2iUtCCCk6fmUJ1Yrq3pFKcIyFH7i6HKffVH3th6JTYaBZaTdt3ySCR26KOnTM4Pg87LRBX/SJ9IGhSIhlsGANbF/0k95DUaBly0+amSJZVjt+Kek15Xi4qoGh9LRXD2Jpr1jW49dX2y2JgqdFzbFvW196r/etA5EvSEJkr7x+fGQgEkrNIyUkXx4dqH9VEhm+knXMtIz1NTwkyZUHJyqR8Um63GQnOLZvqv2LkYHGl8b6a6/O9Vhs7Yl8QT7/nKhM+s3AfOummq/J9+wZ6YtcMplq2gMCi6O5zvwjoAuYzf9GGZIFj5jZ60p19vcJTI/nUs8N3yGr1OgoAp/SHWd130wb/OfTZhMlfAHlTlOLGhiJyg+J5pGhGZ9CpxS/RJMzq5sy5fXrOIS2sVZ5AALvy7zmlk4SLna9bSwNZYbd4cNe0pLv6v/FKNH1ntgtAcGWWR4rxrXgCbQzzW6/5CQbcPzMEtiCPc1vxNP1oxidhq6upvu38ktzJmyuMz47OGdxHgUc/xftrkaq09tQfCaOsW3aWs0oA2D7PEHJnngEGZVOAVsJJ8fUqquStxTGToQoD73YqX73AMZOhJCighlGfYO6YbLsky3RxkPQ92GwufFvdV/wK7Xj9o8xY4JZFwzK1ENhMDpNzQiII741S3JMlVNIa9RKCB7scppkeYkM+n2CiHcjgEB2HqqPgMTOHEd6HP+Jz2D+fut7Gn0/L8cKZoEwf8V/jfnryPCML8L9Xg1MRT6qtmew8bPFNgDM6vj1RnokgL9MEhgvS7LjyvTXa++S4P5qUUeIgiNybsgkxLWjgw37x/umfyL4PRExQ2s8urU3cnaowK6v7no7wSEeIbPGpNRmvL82r0BovHf6p6Wk5lkkZbb01H1upLf2RUnArJ5s9z1lruk/KHsolwA1qGvJ2HB0Sin3y2XeKwZzVZFskqAY9+mwCTRdGnRPOVpMq1Ixp7Wl9zd/Oc9n10kBAej1xdwf3VFjpysB7gRLO3UgudUnoXMMzwW8jkWXSfodkyfhi+VJ5FzrafP5uDv49y5pJWBQ7NxlvnuiBUmQXLp1THjcnEB5jc8+Y/ueUt/vBN1+qoL7ApM6alwS/Zr1nDdKjJ0ot3CesbEv4/5iHZtnMY4xr+kOTw8lfytRT5rXnM9CbZL09ri56u/paG0fEJQXu/Vt2ccxTmLUtDt/CxNf5n7qXNvRi+xJO9WOV9TNKE1y2u+qdrqJLNrhNvh1dkJydILuh0eU0hid+2SisFTG+8V/dkV/jhIovzE3IaScDwTH6PERLWW+bdLsl1WHGyQ7163XvPXOh2BM5jfQ1jWfb3jefzcGpOXcVy211DNX0fu3D8X+Jp+btTMzN+NTPgHhlokSHFkEgTVIyODfN14a+x8V8YDqi/xaSlVmSrLg1pGBhueghEgeW1FgjPRGXpTkwc/Fg+O4eGecFWrQ0Vd392h/w1OZ3OklqdIlibTjSLSE2+7aq0f6G56TRMSdsg+PjPbWvCkmphsKEiT3Tv24HI9dkuh4brwvsnBSDgidMq3jAfLwmhwSjV2+65JOLaUecFmmcv82WZ9djnIsaa54HMFNKb9/+1V1f+Q/6x57Jv9zE20Y09a9p+jXxEDsHwM8QIKWNz2tet/MoBDY7nmeXG1NQnw/y8SdaTt+NMj3qZzPYSwwNfV7tsn5eY4rMSSJ/jAJvaQqRgJXn9duzGAyWpuVyWgOSteKGvM5qt0jnnNu2CSyvR4ckwVVJuzulPJIUNtljFWLqVbx2ZaJlCAv6hLnC0tVVljI5488a1cm96XIhtaEkLCDGXcJwUOTZd+Ug7QMBEQeflam2ViPTFZJXzM51kPiaLdhNbMwQcaMpQIBNFrr+smKs1WZYGBmSb0fRfLLte+WDFGOa3PYbdReIFdgwGGSa2EcvYt2HSBB0Fszday/5nujg/VvwBcjeX701z4o5RptkkD4d1FiHJf/DzVDLCaiD0iJypOZzo/tvdNPgzpEkgmbQ213f+QqUYg8MT5Ye5Z8dpZs91ZJSuyV/+atttBlKc9Lguapkf66SVWaYl3L0QyDr9AdBYL8GIxiqXSJm9ilJlkbtlVpdSWoYossc9ilpf5+V+tSj99DAfbNz8/leCmk9DDkVOeQtOpGBw7MtqrW646y5A5bGelt45vBmBCJj7Pd+xi/Its2scljniorO1ZtM8DbBmP/bN0Trgr7fLeevWf5nC/X6STfvPTX4ufqa+Q3/vfB+DrT8rNa7wW6BNdbnrTavleoWXY5lyfdGN7TGhvjwHJuk+5gE6bkZQ/uNdVUwoIEpiQGr3Ena6rD64qQSY8qGUiZdpll9wmX5JEOIK7khpRxTHzslHfEAXcbv8bPmtfxgKmkm7X2E3lUz/JcqgIDVS4iksPheAQSV8xYOxJhd3bdLiGxfUmMe74jz41tcSTM0T4EGkh+oLRHS2dPxcyJJI3+wzK+ulUPOs72m3EqNZK0eHjk8pqfOEmD2tvEdPSZ2wZqPnhr//RvSrJgHwbteB0KjvH+ulBtP8d662+Tz7003jft/wa+p6eu3TEwrQvVWnKsr/YaSXA87E56SKnNYMMbYUtpXOd3b92/iqpkD7xJ7riq7i9lu3bJ0lcJyaiC3gPFtNHyCvAmJa4KfR4F1TnL4K3Egf9u0xJwEic3zrbuRWVJwGUYyB8LKgEMsX9X+vu5xD9f5uPeZT0fOnyvK+m+5dnuIb9SRLtELNsEh935yM//o5LRiaO04DurAN4xjgxUZaG8OCjBoVWTwQmOVOnCziq9j/+up3xW3b/t5xXuD3rsc1DGJz+o9vufTngts1qBp+4RJegeFYTqCOQY107s+aLKxqI/z/deWfJjL5MGMAD2UaN8622EkDI/aJ3+4X4tDfdX/M1F1AiFHMzq1oLHw9ag2gNsWxqqDccOOdLd6NxK8OjQA/FHcjCTOoDjYw2Efu0XtKnZPan9zX690fv1eRiTQe4DZR8g9UZ2iYLjX52kQeQcSVa9BZNNSRLcL2Uj89W+o4uIqCxQyhJq3f2Ry1F+sq2v9vzAc6mvdkCSEgfNNmR9DsLfo6/ONSgdl3U421k7kFMA01t/iqhB9tjJFhivyv/vhj9JNRhWhkv+BagucijBQj1zwECuvmT3dunc4GcEPKl+M+m4kUxMSSBTrnPSGcwnfZlcC3yH8ronBRjWBnUtKWGCY2iishLPzObOoOe1rQjMNsHhBKqqI5hKwFdKmWMOyZmVIc/5v7ISHL/w+V3u0Mm+tT7HOaE/+5Rv6W1q4qLqJri0b4w3GTjqZ9jtqIvUGOZwNd8bMWFkeeHcDd8hZ3LJUkuJajCo01CxgNmo9upJ994Q3w343Onk+0PZlKRVIrqb090BnbN+yuiSkHI+ZKVODFK9gMHT0UrffnhDqBKRwehyPPTzflhIayxr/28MN9iL93jN5fzarGY7eCtqYghZ58Hov0O5g9k01I/jZh0me+5qGyYmrmkPt6H4GUiewbwVDudIrOA7vIsybVU129HWSih9GOuPPDO6abqaFVPGgX2194wN1D8t5qLJAfToQOQUdFEZ3RSZE+oc6Yv8+Uh//VNY55aNp7/d5/x7tyQqHhUVyY6w7THHBmAyWveEPVPltIpV7WxzUsaMOEmdHu/vAuNRHKfxkEmYSkeVsjkzTgetjkkXhA2ateHka7731QlaYBZ28IvBbjJo/NBke36pshBdIgjlWLln/wJakh73lmOE/x1j6wO6akwr7/6mOqgEnV9uyXy8O8M+9odNcDjPoehZ1qzp/ApLYsyVbdogY6w42qC7tzv++aAEBxKqUMQgSPI7Fq6295hMsMwg5ThebL12UClojCmkHB/PfelKl2GkU/JjVACvVF+wL8aY7mvkwUylS7qt/agxYA7buayswbUyxU9OMt0OU0/znMZ+KFPgoC55pViC1JBasWsSUtX67MGYQJv/Hg/w2jqTESYhRQY3eL8Bus4+7sowu17xCQ4VSKQ8MDB7dp1dHhIWj8z41lCDbWn/mKVq4eFyt0It0AP2w2rGezh6Wj7r0XLRN5AQKXvA1Ff/DdU9pb92lRXkXwAVhJSjLDPnnCgilqKMBC1Ywwa/Yz2RcyTJ8eIIPDKGp5+USlBM+5AkIu4SVcgTo5umhTKoQrJEEjC3oUPLWO/07+OYjvTUfWV0oO63ss4Hb7tkek716TsGpvxeUNIJr03We6YyHIYBW45qAJi6BVz7b5VyltmS/T802X4j3d1qp05uPF6Mjhg5JDiGCuXhEhT8e1pszyzXviJJbilW9vsFK1rVctia1awrdIIDz3s7iAsyVPSj2LPalv+NSfCMI/mvXnOUR8b8coV7LGFNHjjH+EbzOWefler2eJGXo9XktaRavLq3/xGUHU74zJckh1VicBeSppW8n+hYoifT3lKqpwCvB4+fXtDytH/HnlTi0mW4PxzblqEF82Oerj+3B5R7Pl8t5xUmPILK1N2eT77t4M96GyEkxwG09LPGzHvQAF21BHPkhkdQ2+YzoFgxwc3vWDUcC78sKmbzcIORgcCPsl3QCtUzsDiCjgfZfBZS4SAjuIDlTvbKth8WIjMu4cy273nUW9MgCouXRa1xryQFnh/rrbnYGQRH/lCSB7ebgF7KVnZIckK6ldQ+JMaeT8vntoT+rsHI56Wt64h8nyQkInul48le+b7XZX3X3t477QPhkhsSaPRFXpPt2SV+IQ+qf/fUHBLlxR4pL7lsx/CU9/EMK/FgW8pQAq77oVJtg5Zr7/MLoLxBaNUloGSbXV2chmMDFXEfQxvxoPI+CaRyXq8EFpXg52Jjm2R6O6KkxhipEimnNWfsy4VKcCABqTuRXGZ1DVGG2Nkajsp7W4p6HxAPDE83ptdNe1y0fLWUOMs927XMqwa1zSL1eMMEjDdhcsVu95rrojsu7TfrLnVZQx7H+RxPedijoVRA7iQHJlumV1oQrhO6F2LiDc+XiZI3dhkyOko5XZ50hxxt5hmUbNeJSdus9ElvIgWqXHPMUVrsNxng+T6VgISiqJzHEfsMDziotYMUJOg8KNfk+VDk4bxIu/cp9Uy630khVXuEnLgDaFd/b9UX/mYM8vSM3V1eTw25SBe4g6LE2zOUphzX3TMWVcOxyFA3X8nL0XIYxKF1GmZ/gmam1cy/SOv8WsuqJJBIY4Me/BiAKXNSH6kyBv54KGRIUl0n29ZZaa3+ih6oXTPlnWM9NR+5VUxMqzHQJIHB120BdblfK1kAKr4PVp3+LcocVwbFymTQ8Tt40jJHPoSZNcfPIHoR7gFow1mxz7/0ko0jqkUfZPayfzAOLEcpoDZ/fCsgGRHNKVHlKNz2BcigZ5frN4BvQWrf4ut834NJFnt7MwRldoIDx9H7uiofkyQ4xjIIqNS5ahn5udpRiv+Nt6NL+vOs8UvFDrZkm2ZY+/8CgirrHnGy9doyz/2j1Xptr7f8FskI/do+qE6LlqSTCbKRgaY/qeR7LSamPO1gH/M7f7IJfE33Gb3cUAnlxPZ9IIyxN9RCZqLSjC1c5xxM4zOo3uReem0mo1LEEJY6a6dfeQ981azvG6sEdYxOzLxhOlxhu1QHJ4mftDLlBY9Z6EveRIgkwNZkGNu/hUlXKJw5EiIkB5wab09boszL3e7BSdPHAuRjNyEIriZpok97x13wl4C3A25mYZaxgRn/YJftYBAXdh3ZLOUyQ0vOLEswg8Edfuvk7I20TNMzBGZAfpvUdX46dZxV/a6WIkbbRUX0TwiisOjZqIdM8gYmV7a6KDXbGv8NtsE1aySD4LGUSdYxee/VlRxcEZLxfmQbALoHSttKe190BVfH9aDuaIhnxhGlACyzsirjoHkCBSKS/ZitK2Wtt9W6NE2anct9Xz+TgmTQzWU7zx3lhElwRPyTILG4rUKYIGnVbxvxOvLwGf+gSw9utCZkRvHM8I5REKzh2WRfb5naIiMJUmwZeaolqzLTvsh9nqjOdb5tje0xDcwYA47XxX7daApzjbmUJ2/h/ysxAa9N4a2EoowvApISGI9MpJrFxA88U+wWz/BDqcbJh6SqSQJ0T3Bul/I8jXPNb//sLnl+55luSet6vnkTmK5kWQE88gp23kgCPNSzcDj6957zbsSv3AfP3Mncip2QkqFbQ92d7UWKgDT52Z7oezySPjGqin+1Go+Dbjlqz5J+r0AP92OTrUvEyFD8m2GUJhhUmtkQn4BpoofCbdZArzvMZyuhmwohOQY1S30VW9JOusQD3Bv8A+3YM87gFe0goxvlWrs+rSV0ulLgkkoYuKEsM2SSJpngv3Ug9sFSbKNWsgWoI4NNNoMD/4yzhY3lO89Vq3GnS4yUqwQE4ettpWlwEkeZIj6USfGIxPdEqkfHn8DlDfCYnyeHMeksdgtN2wDVayQKBUlggsMODOU56lcqUkwTQ5Tu+IwFRvIpsyrCNp5tKzeUyXCmhJaUBWvFwSPKw0La6/qN75RiajA+x7P/96Gtb1U9h1IJiqfTk3suhZBSV3gVT0rVYK5vmZTzuRc3+Sm/XaVU0uHHvFZpgX+48Wx0o+e+Nmwn0mFuW00GtYRUBVoSuyuri1RueJ4b/oNJo6EKlyFmvlHFvuXaT8ks55cEsFrFigpkUgVf0jXHHvTDINTtQ+JqR/gaZtLMTJmWgia9BDBASH7Oqd3dZbd+xQyV9Rt1WMHSWpd/iWyDPViGCSvUJLy6SdVdX2Ie7BfcyvVxXim3w+kGk5ThmsTGtZmSLKojlVMzfSzgGfJkOWW3+t6135iKQh0AJSIGzsoUFsoZdJNImU57l2ftEoFion2ZjgWoLv492/XoWu/DwUnk+OnlOs/tAX5Q8JLmSyXlpGPD0Sm6u0+L6n7mzDTvCdjH1/CeMEoFnbx41dU9QsptTZJAdzi6vRTPd/1cDEhixL+aOifcpTJ2YGgrYJD4dzzHVPeMo0otJMkQZ5In/kMoIqG6hKoS5QC5qEv1eOrVgOToLRXR6cxRcR2zkhv9KMHLnChMN+rNNBmGDjaee+gxeLT5le9WZoLDtF2OPuF/bSLB7ToeXZ5rdyhVopIeHyS7z5hWtOINolQcVtLQHjNWorIhUG3nU3Ziq4ptjy25xqdy5EPyArXqYsTXUR1L5FulPDbImE40A2c9oL5rZXHnZpp9qRY8LdOO22UVuaC6g6QGo9+YTNeRnuHSxlPxb6c91J2ZNCONne46zo6sT9Xr+w0mbDmy94GYlEVK3affAEmbhGljsxPLh4NMHuAP4HPfvaPUEmdPff9R+FJkPzBWgdfegGfIU4Wu+c8GdJBQEmAnmLkY6sWg9+qkf5Cy8dFSzUKjjC+o9MfP9Dvtd0D7bL3PgUo3KTEsU/D0XWs7dmZIsh20Zol7EXTLubgpCwXf46o0YKApp05NGAP4tOw9gASebUpe7FJIVSqbmmBa6HntG0FlKO7ESLQPz1NX+WgZl3zHV/mgjJMd80e7DK0rmxI0Ocad1uf2S5D6s+ySqsny2dR3InlQQSUXAffxqzIlOHAP1V57vp2elCdFgOmvas+dVNLFf4txZYZEb0mutVzPpwkUcq4JAvM5qAH1c3VTJf728HWrlnh5W1/kb5ngUGZ8kc6qWPqmf7vkJ7TcgOBknkXJwXPmZoXESLUYiWbed3eNcr4JG919YL+pBQ71UHGy3o3l8tjI7oGdXrLk2Ydjet+/7xnU/psxNgsI7mrMur37n1Jw+D9s7TKjcgRQhBTiHuxVb6iuCWUwVrMH80gehg/Ooebwn8XFLGap9weDY7kf7cB+ZfN+3cL00YDgeX0JE02nWUauHn+QeLffzKhqVe7Ip/dPnAho/HhZniMpPyaVuPBNMtgmt85s+UfUbwOfAwmmAvbpQSTSw5gpBp7DTlLgoQmOYVeRE54/to7TfM8xtJWnizzP2l94O8/ocQmSHIcwjpPlXq3kGFLKK6hhMGmF0gGzyFhEKWYKtCBhM5FSomjHUhKTKFOyjtkr8GLJ+p4o228ribL9nC7nvtOvbApBryR8vlOI87Xg12iys5D/mMubSPO2cMZ1HTQmSyofpNwxU+kfkkipZ6HTPajikhwoSXLGp0cnjp9Sag1MZviV7lRKgqNa4mUmOEhW4MGj24sdnuBC3TqZ9ttTdhEYuId8OGzV67s06884M27HjFKhXPLhzMcqZQyFAWjAvh/RD7yfuh948dPNQ833c1bdsDfjn5p1CZJLptreBc0GEFLR9yGrZjkZxEqAW5ZgQJugQe2Qxz3w1Az+OieXep/CBhEI/gMGrUdKWXqIshgd0B/zDZKkvt/p3qCC1QetbT5mZN9BJqqZuiAUOXi6daLuMK6A0qPcU+qOVNeTg073HpgZFlb+bwdYQWqaYpYt6TIH32SKq8OMV90h/hqpks5UqeeJip4xv8/2xAhrsJocv0yQ2FItqGVyx04+Qq0BlU1ghyQpz1WtWItk+prnGHZ3YHDvJM2gdDrk9ZCAciipqhUFnSfhc0CrgGMZt8EutcqzdLz4z0zlT7d7gvvFoWopUSJkUqLLEJbpGaxjlqzuGcy+eesOMTuGmQaYa2JArEznZLbMkfmiBa1c9OI4Xqn7qweQVpZ1xqfyH5g4M6CQymb/APUYNzkB/TVop1UxDz3piGB5YZwZEBT4vo7stbnJ+9ZkSqvAoGy9HMcVplbTflhaD+NFqRnnxs/yKibVBO6pPl1TOsqxLdp8+hC8KG7bPOsPcl2Pbk+6NWCgd2t1JJ2sTh/uZXWptwUDY3gtyHffk8HnRHkQwa/BKH90EOKnRHiqTM/bd+ia+4yKSft54JW/J58pKHvUySYVQIpypUDb+G48gzDeMTX02jPgQKZZ2YKff3aAJ/4wnuTL9y2l14LA5FCFdTEqNVBIuErm5L6G3zefZBeSEcH3TpVoNOfMhXaCSXviTGTsjy5zK7HdfuawpXsmoZWyM/bHtmzbNPP3vYsukzqkE5Wnmb9jTG2Xr6DEGMfcUZelusyocq/h6El+61algtKVsRwt0nMFXk5aibzVc694DWa/iAtsdTL+DfNZrZhapSc5RnX8tFPFT9I9CypzjpIIKcIFi4xrUHusgJpxv+XNih3ESgsnl4KjAAoAu4Y9m57qkE+qTjQ+XUhsV+myB2Liu+Gpzb9XSb+dG/Jdnpt6rWeAUO8xIN1hffaRTCoaj6HVK57PPugJDL/FK5dUC2g/mH7tRzeWy4zPdErKtpxjgvvgKUHqgWpo5ZzWyjBAUVCGJMG7VXtt8dBwfBriP8Qzx9tm0UrU3OdTKvTLspxfTjvx5DMkSEXieiZkkbiwTDfvkXP3jIlaemY4th9CUOHpXnOuulbRShZJB/EnUAGgqEhy9fnI7nmb8pbyBtXqNw9KcFify9TdDpNSUILk6/GjWvKie5wkZRGcVsK1i4khbULrTQbuzeTBkyHZaSvSWtLGylBuyOSez/1ivz2mdN6nJsAOZddNTtS8TlLzBr/JnaLd+4J9lMqzSIlzNT3XoRjEtRBkjoqEtZ3ozVhKKCXYHCkRUurBimOCdSyrlqEBg68KSHDYhnoF8XDQBmn7s705pRkVoX5RBlKV5idhmz6pGntknVFPjUVksnayAVl7zz7a/dN3Oq1fnUV3XzkQlKSw5Y7Owz71Wf3aW5bk+TRemaRaBkFyDt/sSWr+qtSmoja452BWuhCDaRVkBHVUqILrVKtQfI06S9VRpQDJkHf4lp2WSSHkMXl82O89SH652wxP3CLZNsA2M+Eo8QijgNTfe6dPt5lIWX478TUIep7a/hxoM+lJfpybjdG5pTZ4GuUCuZQsobTZ1fZSAvIwnX6Kk5hUZcf3GMUo1D2Omb7qvnNcX9NXOm2u44uRPNIz76dijAPfErujjEp0WqVeSG6p10znGFWCkt5lxVZLeRO6ULuaUsCJl/hvS6lgwPPH02XmAfeYqwSLU4KWGtdJCfNkevbrUp0ns0xydbyNkHJy+8C0/z3SG2nOdxnrmfb1yt1HkZg5ZSeLUgOW9H7WAe3tzqrIAaA8OOztLJQJFgykMslrU0kD1c/eThINVWxCy2Uq5e6SogfT7zf7Iu9tcCeSkq1e4S1wks/xagqadbJ6sh/0mzHTJVW6p3h5jPMICX+PiM/xlm7kMrtY0fvoSeBYA9bzq+M3Mu0SS1eaUNDt9ygUy+3NYCcQgroIePwO9mTjn6LUFUWaPS6X2a82i3WpSKxxy0+DriUrkPftdmYlODZ6PQKc8V2YReT3/gnM1pIHjUioOt39jDriOu/vlqHsrKgLJnF8E6iO+fquIM8G7I/X36Lo4zyZjLR9ZsqlytGTZr4Jvup8Fqpx6gtQxuP/dcfFPRMnOKK3lXI7t/VN/3BBYtneWpaLTxZGemv+eKy3Zl6+y2jf9O9WZMZRzcbFx/XDdtwd+GZVqjJakQkOq5YV5Q9FSAa8GdRaUNds2m3E9lVyFxCrbd3hYJPR+LmYDTI38eTfnZZpGFCd6vu5zbH3Ki8NUa74DNLRTeBGPzWMrjG/sZx15YTkEHie5kpsik9RpXZPynNQtyhgVmpDNWy/pz2kHbDMrpLjX+uz/W+UOmgC8BSwjVuDyqBgzm3NHl8cYl+9wfaTKkGFlpXZLOJ5FWAEeSxToqBo554oC1LnW/wnAc9inw4r8Ygl7f9uiAQrJPN32SWgEy3aU8Kv3OKtUt7PtI+RKWu6I6gFMtQJ2svmoC7/eFj5HqgOK9IGGB0+lCI1lsCki/YOq/UYSD6rOsOI2iObBb9BJgUzrkWt1tllJdXuLVfnEExAucyIy2R+aiXqjo0MRD9Xzc9BV9LRUv9pX5aXJ4qfSmlOunUg8tFCxLLS5eQLHOmRigfBqqc12y5XkCmZaF1mMIGKI/75ihsAWt078HAv1Hr1jJIpu/AP6tNnUE6t6Js06pOdgeniiki6OS0DL/PUajZl09e+0KhroC/ymW2baj852j/9ZCixRvprv3hr77ScvAbuvuL0d431Tv/+eH/ky8lloOZfxzZF/mO8N3J6UNLMNzE1MOVP8Hls33h/zT9hyel4bzz97dt7p5820lvbP9ofuWG0v/YyWe/8kb7as9CKO9v13No79ePjgzXfMPs11l/ztdHeyCnYr7G+um+HOB/fMdIz/St4kEqC+VN+r5v9xuv4PcrpnWCA/NkOpGRwvWUyJjfUb+D23rGv02urOEEQqlVkebc/WYZge7z0lWmQf4ZnWx6FJwd8qsw9WyW6ncDTKBd+GOK3eti6prbnYtBtl4Xo5QWYLJbleMHXwtPuNfVaqjW6N8Fh7wOMWAOfC4PRZms/7/ZTVmY3hkq2gE8mAErlhaUVSqYrz43FMlV1BahFUhM4pSHxH6LkqJjeLtleq1Dhwg8NSR8Y7sI4Psy4IyyqNTMSS2IcrMsDL0Rb7mxK1Co7uaHUVoeDFMpaxX0wrAKIEJJvoC7ZWx/n52f9g001A5IpyXFnOYLPjDfVoeh51qB1sLAPX8wKqQHIWPpr1ixLni0Zi5pEkEEi6nh1pnmZmX0td6CojM3s2l+P1B/mjaXcntsumf4HEkQ/Odpft08C67ckYH9E/v+38t+XRvtqbw5b3zzS2/D50b7IwyMD9QdH++pfkX//RgL1HfLfp2T9R8f6Iudkv6665tHe2mdHBxuOyLbsk3WMh/V5GB+M/Lt85+Py+d0j/TUXy77NlsTG5SP9dY+PDjYeHxmo+VnW29Nfs2C0r2736EDjcdmWPXKM7pR13SvHbo8su7Pfr5o/Hu2reVQ+s390oH7fyGDk8+4ER+QLY321z8jrb472q2P4KH6ncp63+jqyfSlu8KqdJhOecoOqazeua/P9yhY2Vfq26zrvw+mD5cZ/Lcu5kCrbNAtmLt+wuk7sNN5VZgnTycflnyGJ7pyCEZn5t77/cDnbjrs6yYjPQ9B1hTGMJ/kRs0pUfpTheDUWwuNAt2E9nmzbm2OiJNR3Ot37NjlKh2h7sUuIXK13PeW3kx2PouM1lEQVWmmszbYfsdpf7y3khGM5QLm7UgN5fAr91GDa3+5IhtgJ3Ww+zYiUkMIMxD+sXajf8jM98vuMbpOU0Tip0mrp8JAMGijkfQydFmWmju7vkw8Mp92qPfB8sFJncHUm3afNoCqtuUO1+kJiy0nmXKjOGbmpy4Bglm5/pZfoNCXrLMTizKbcMUEy7ZFy1I5KMH3TaH/DU+b3HNtUIxLVhpclMXB5juv7jSQ47kheY5jlkWTHtt7aRKgETN85fzsy2PiaqBg2h92G8f7aqbJPL0ky4zqoONKTDHU7ZZsWhltn5MuSGDksx2Vdcl831f/dWG/k1bCzRLKOa2RdB8b66x7ecWldWgtiUYVskWNY9oBaz1A9Y91He3Lt9lDUwFiS1QXbZ1tK715uKNb2F9KkNYPH1Oq3VTj2rLN93y6Hia1WNNqzlHcgAMDfVVtTqTMPGC9Mzz4Qi41ZCY5f5Ha+xj9vG5WWNbBMTRgd9apRXGoYj4LDVmZ4S1vc57alXpWOR3km0nzVvUU7t6WTUElLYFwdbeKxEykW0GPAN9L9WmJ3hylnmqDU6RW/DjR4Zlbb8ULpOa5PmYB73L8rSuOX/GMRVQ6VaUx7XzlKCwmZVEBeOMGFFhgsIKjUfaAPBxknVZIDvZ2QyTQYyOnB4PhDaNls/Ar9YP6Qpy/7i/hbRQ+UpQ83jNYqqm3YxMsrdlKpZOdTX+RqURM8aRvjjQ7U3T8iQXZuCY7a2+Sz212/R0/0IztkUBlmPVsvq3+fbNfzUlrSE+r7L5363pGBOig37gky4B2XEhVJxERDnVOX1/y1qFP2S0JjhTvxEb58RpQlw1BnjA407JN/3+lNkMhrfbL9V5Z10CO/l+NGnzw/l1Wamk22qUurS46oFtAFcO4PKvEohuRWJVVT99YXCuG8r2fg/ExG2yv5nu106Ik96mPuWpZuBHi2eozzoj4JmTUBfi1j2dTgo9QrGUQMx36Wy3aqrhllMvfzuXbuNEkpn8ThWUFtYpXMP4vj4CofyyPBoWaqrfFMNY111XhMFKkTlYS4lFxZtC2edDFBqitN0nw0vCFtRrPal6u5lNFz/T2Tsdwkg9pIGwu/mmGCePHbCCG5s3Ug+tEJ2lYtnWgdqt+3PDwg+XQeDvGlSqIqg4Zyyj59BoH7i9nKVs1OpcpQHvckCg5Wi3mSrnW9Ui0yIFDGsjDhEummNvg61b93enwpzOWQ+DILJK06a+8yvkPQgBps8z7M0vhKxDFTJ++ryAGTKCSkHOIJU8KjEgT9dc+IymFjbgmTunFJcoxbwfrC0ZDqDT2Qe7dsl2xHJJSSZLSndqkMsI+LT8aCwt5jxMhqoOFVKSFR9xIcr7G+mgfl73+YQxJoSPbrUpS+iErlTSl5ucWVYJKkjqg4hst1Tuik711JwzSZYa3AQdl3fe71R731wjmsNxHQVau5BNt/LN9kelD7R5hIV/L92u54Zas3cvGlKNDvk7DbTvp2wwo4V5Ldt0QdmKnLmfgE/DLfNsTiOfAJ+zlTrt9Pz5q/po/X9WnnpaUosLva6dfmWcH46RMkNPNO2OEas81FqyxwNx3Ynsw0FrOTQUikutbhGKQvw1gPY51JmeBIdbJT6qtCj5V1O+t70kxvq7A97AQq9tey6QqFc0qUHp+F1w4MraH2hK/QiZhcI6QYN/6HAi/SDM7c1YTnwfxYkb7jHWo20UfJUq5a6KIdTzGE8u5nUN2gvNZive/GoHISHRx6j11XxR4DqAn663bB0HKsp65dgu1npXTibiQYcltf3XZZ1yOynr7R3rqrRKWwW1QiF4Rdz46BKb8nCY7dSASES9jU3SCDjKPjvTX/XMjjtL3n3L8ZGWjYL9tzp6g4BlFGIsmcPVt6prwn9L2qr3ZIPDyUJwJKcORYH5Ik0GXW672j/TVlab+MQE7O19vNrFe+7bKhTkH7w63D9e8r8LUb4GfjKM8KnSCQAPTkAj+vbgx4XnXlud47AxIn76/Ue5AuB3k2bfYvoLNEKUDNvgq8JWDxa4WsvJ6GYs+5FHj+svVbg/yMPEbo96FDGsw5s120cvXGSuj8pluuB5b1oltZ0IST3V4zUztj+Vy3K4EEpYyUnIZZtImta8a5XEm00PdSmUn3lF6gHPvsgKA1br2vJe0+L+XZevxzBAmpkaH4NytNoZfnffxiSxX0/SLFHKttk2BMhFVp7NQYnOCIXsPokpByX6ROP3G/i/SFSqwbz+kBZxlHFdPk0yd4OJLJ/CvbAVAlHUvU7XtqDu/GwCtoMGoboWVyyne5xUtXGgwexgbiFdt+SgL2KyQJsVf6gD8mJRivj/VHxvLxNJDylttHB2ofEjPN5aIOuVjKTHbJf0PLFFXQM1D3dNgEh6gjfi1moAfQHaaQx2m8b/on5Bw+INtzB/ZNdWWRBMf2nvDmsLKNgyhDwb8xwyuqkNGxgcbXxTukQ/8mUqJSV/LOEToZMWpmo6B0ymd9alYXbS+lzr3Q92CUpATc7x/Oa3v9k7t7C739njaOxwthHK1/P78WmBVtfpfWWcoZWG+s5G32+IU8isSg8uewyk4mChICk2k5Lgiyyjf+SpUJ+7Vkt5WNsp0r3AkO5Z2mX4vWhRiXPJtlOcHTxiNBe3Edda2nQtWVNvDvQBLML3kJ3yCfseKsbNQuuqOMSfjANLc2rMF4hV6fa/z85Ao8Tr4gVcZRvW1hPaa7Hv+N/Mb9hJBCBCDSHqoU0uJKGQgWLSs9EP+79Jq6eHfeAYnIcSsqWeSSRE88mHbV5g/E/jH4ffGbkzWfGd5XOQmO2islkaBKVJx/N7wy0lf/g9wTWXU7JKFxWyoxULtI2rTOC52A2lj/Lkko7LaVDVn9rn21V6suKb01af40ola5QnVW6a0bk319WFQmtVnv16bIP4j56luSeFidWl/tzpwTHP2RZCCLMhcpC3pAjv0L4z3TfwwFx0iJS1T0ANq0L3ylEEm51MxQ/NwiDC4fDzLrzT1IU2VtfutcVISA8KVC13BjFtY/8A0OGsv/TLNn9lOS8ko2p4Oiw1Zv2F0GHAVk8hlg/wZf8wlC7Vb1D8FoFAFFtosyxLWMSlFGWb6AMhns7fFTAni8bVZ7jsPabLrJWPcnBK2tIa/tU0z3J0/732PFbCVaCHQHtqu9Bo4Yw+DaHhme8cW032Mw1mYpajozrV+XeNv+N/ugAKlmg0hbnYvOikVKonQm2yJfMfNPqzy2eNDvWVoOg2dCiHfQodq+eiWi0Scmi4svHnKWsdErxZBV6qD/gE+LwV/l02Z1ZGjGpzBjWSnHUnuZmBZfR7KpQ7UH4tgf3/1E14nU7NAdVfFg649cBZNR7UEjvhd1D0vZxD25zljL5++WJIBr3825E0YCi/aoOXlwSNICJSpjvendV5CMkORBoyRADso+/jJTfbwXmIlKAuKIHK8LvfsVdt9QFuTtDrNt07mfVGqXgfonpKRnRJInV5dsMIigbDB2izWj+S95r9Opuce18FSY4xwiQbAtYBY758RQwIz6/kK3GNT3k98EbP+KAm//k8U4/gU573xaDSJxtX14xv+p8GCgy9rmNDPgLVfUvytl1p30x9jgcw5vyNcwXMpGP2M9p+8t4zG53a9DSvK3tg1CPRMm9nGQf3cEfofdtjdkyRi67CXv5eKpVi3dhbTS1K1cGYzfhHMs4+9h+8MMxudMeHyc0tob08bPZSwTyzPBcbFdEgV/vW3DDX9WqGVsqPHjrnt4CVoNFxOZgFxSKe25CSH+D9kh2zMCqo5Js292pxiRdBZy3Uom73GE1+airwW1dgv5u1yKEpDKOZbx0+0ZnGxMZG0XeKhc/BM5YmRqGbKilKWQLSyLk+CouxaJBOO5IcqHqRJov+HtFpJ9sFx3r6gP7k1P/tR9DoqHbNeDLipj/dJFpa+mN+y5jO/HPm3tr0+7/sd76/9U9nmvnajIKsEhnh5QhvgpSkQ1sl6SElkfL1G4XI0SF5/kzOljg/V7sX1IwJTi99cdBW6wr33M6OV8Pm2O/RUMxnJpmxkygdLmb6YZq8llfRIA/a032Nby7oYiDcBXBHh9RHO7p0VP8usE5idfr4j7jtPy07u9D1ayV4hzj2/6mNU+dm9Q8mv0ivif290J/BJX+rmYVzChJw+SZqjlOCZa4n4Mv+etVzZ+IOD8jFrbud7zPL7cut7OC9xXeFCIcgOqXChCoVgyqowsnvmXq3JR6dKi29nuhSliJZ9r2DePWSbup2uyGVPYSTh4yWTzfZj48esMhL9VW5m3PAc2lbILnp1Aq8qEkCSyvL85I0pCKukiTfkfHM3kxl2dCY7kIOCoyBI/UrD1OiUpd7rMu2RWAzLc2zbP+gNL6ZCT1BwDQD0gvLESjqOW4pv6991a9XNADYAC+n3rAcPZyZu/T6cDPWv3mkoMSV2rPhdfRhs6zFjB7b7SzilVliLlGmKeeVC6jiQl1KJyuFmSHHvFSHNm2PWJyecDcnyeG++d/unkoKkv8h+jffVPSGnGhqzPy011J4+ILwW2Jax6aFufBKsDdTvFC+TJkd66M+3Pb+urlYFf9Ih4joSa6d/aV/tdJ8ERGTM1yqprTl9knSQk9o1uqv+7bNaj5Mb9dTvkeNwPI9X0ZElkrXzPEVHB3Fzs399RhanBvrdM4hnlnTEcG5hwkaSyMu+TblM+RpG7i2XgpzoB+JR5QH4ePimHsoLo/X7lIsUy3nMSQekJFQn8z8/lOnZ15Eh1T1hbcUGbMrGNbvTzqcDzppKfwVolagx4D0/UlthRCoippVwbfgaEdiIw1wQHgvRClGfldS4nDbjjPRkCznhQSai+j+iEXGxJdgGsKsc65vhqxJcGJVashOLj1WSeCFWp6kJhKclQwhQigXh+LvcU7UO0zKcT3LZKL+UJOqfgAeWUrMCktkCLs/7DmcaE1QSe0ykFfPzmajHeJeSEwZmNlAF7iAdBNYD6vqR5nATiBUkGYVAvqgzPLNpuDBw87/try7n7WNgZzWSdYoG2O+8Hn8g1jZkfAjwMJKxBq2px52c6ZrfP9VN86EHeUdsbxZExxvZYru+9Qd1XypLo6Y28Kt4Pz8ryuCgl3hjR5SDwvxAFwU2iTNgjpqMwIJ0wOTXaU/+Po701b0qw/4IoKH472hN5Wdb3uihB4FuxD9+xbfjcP8vqN+qtm4/tkUTA46J2eE7WuydsLagqRxGfCylx2SP/lWRN5FFZj3Rlqd0n6o6HZduyTnDIMbhI1nNAykeeln3bNebs1+vYX/nbCzhWWQ3KZYAoCpn9Y8o8te4pfH68J/IdVwCIUqG+2u2y77cWNdCU75FgYnNRZ7aG45Fi7gO8D9JUAMOx/wyjmsJ90Ke+HUqQEb/uGQXdfquG21r2hG3d6KdmgdllJdVPI1GEVqgoWfIqBeEjkE8JZAkD+UXWttfmvT47sM81wSFeOXZ5T3nGXMrEc3+mJAM6q1iJt0uCg9HsJ1E8svpXRdnxDf/jrNRN3uvscL4tpYt3X2j8uJ2QgbdKWIWAfa5CWRo2Yeo511OlMRWuSLXOjc0TKW4LcD9YPVHZcjXhqOriPdmqogghpJA30jchfc1roIlZdgnC0WbWftjLAGRxUIZeBg4/cDmPS1u3bB50Oiv8QpiZmaImikRFodrdymynLblEIGN1j1BSX++xsBMckMq69rMn+h5lzOjTHk8niF6zjvWdSC64fl/VQzz+o1Jnze19xDZ5ZajwwZDSkr/0Uxr4IT4Sv+8nZcXnw/gAIDAzwRnO13wCTWwPOqrcPlD7dfhooEQlbDDlrOPctMQUrgH8Pcz6dlwz5Z32eef32dHNU987cmlN0QZMjhS5sB0c/FQgpTifkcxO6xwifiKouZ7wfJWgwTZptJbLvNdoUYJ+BBKWPN++/2wfiv1NNteJn6QcrXIrZZDqdHaJn4t98mznUXgvyOt/XA3PYEnC/FQrBgqmjMHvlHeJyuboV6xA9rmS/766Owr8uzIHnNFmK/F5uTtBBxVKdCO6xIVRTDmlta7z6oCfFwISrZ5zD4rSt6A8c9+bpXVqBhVnSY6n0ynvTb2db2BMkUui0lZhYGyX47jzsmopeUvf9pQysRgeSvrZk/Q5mUzl8IQQUpobNWp59QMv344wkNTaagUtkb7UG7D738xVzfQx67OjE/X9tgcWaFtWzuPolKaIDF2kln6Df11KszvoQa5NE/VAsulj7uOKevrgTizw4nAdO0thpDo3qDIWZ/YW3zOZ+tGTykLNpPu25SzsUsrOHbqD1tOebTjk1NxHp8AUzgQJSrEhs946MfCWZ4by+Xxb4+aS5NCz24fTZ5jRYjf+Q5huIimVfL8kb/S99VHPZ/bB86Scaggk/ZCcUfdL8Q/QXk72NqJD17JqqlnHTH/qXIl3m9+iAOu9KV+TUf1sMcf2tVIeF61+fCGbyQuXykiUjIULZF37n9ZdxWMorsxe/dqgKr8L3aUFEyATlbwU/LpRJa62d1Hsety38gi+V1nHZVlO40VVuuc2y63Esjf/sW6qXXOxTIvhbZLyOSlvYowQQqovGBHJtUko5CIPVFL0odiPbYWCo9iIXRy2fZY257QH4gfQY91vwIC/2a30YNJZtuOImVIVLKQnJzwJoJ8mTaMGY/9svyb7OdVP8qhVIc9ONFvtmjGXGWbMPo0Px76c3pJXLbdPlDwiJBfsrgtFXJ4tdfcqBCh6lnhfwDYdTe+yZbfojE4rZ42506pRBThHA7bxsPYcOehTH/8SAki/+3BRtxcljqLmk+TuRbId16F1pTX7bC97kVTDc6jYZT8Fv15EIZFM0oiXQSGTRx710IN4voZqE6vahLoUDEdKm/iJDco2rMzmmKA7inW+DhTsupfxja2QxPa4g9CkL9vxoFb1apzlMfNUJqQTeKwUCj0O0KVb0fsL0bnE8YrwPyY5bJud4JhdDdet7StXrBauzr0vmdD/3tsIIYRkObjS8k8oC7YO178vzGcRICP5YDu5q4focHRuPjMD24Zi3/FpJfuqasWlzU915v86j2z8u8U5RtHz1Iy0PGzgDwKJpxr8YWAqwRwSEHjA2zW+QQoJu04Y9eKeBMV6y5X8HPxNl7bcowInH98O9wDKasNpyo0yB4l7MdPMq4AUPNk3HD0F9eoYvI4MRD+3bSD6SXQRsdvg4f4Bv5igBYPG5Pvls6hBVusTD59y1iM7svXo91Dnr2cfj/nUkj8PA1GoyiCPryT/ByjJcH9xasjjv/XdfqUmgBotvg4z2OUoR9FJc+92veDcD5U8fBFUcEiEFErxUGp0whvKjQNQAhU+CPNvFZzPUqoyR9w3wviQIDDO1MoZYwdlyApFKZ7polDCdSzjjU+re43cc/zOo+1XiddSyiNMmYea69kxtI09aU8s+JYEypgo4HgeKebEjN52qOmOqUSVJLgKpg5yko4FaYVrlbvsrpaSMtnWnanxWvzbRXmOWgos73iREEJI0OBKJG96tm5Ptg7NML/UbuV2GQpmNy5D8FGo0oexgRn/4COPTvZO95tFLVaN4sjwjC/6diPIvBxUs6HOjOgeHUjs9g5uMACFwZfPvh7VXRf2uczy5L1+iyfJFMKkUWZmSzwTTshkAgEfJMpQq0FSX23BNq5/BBVIFKCsA21UK6GEDSV/SG4hSEPwWUmGpvmiDXiX6OTSQ9n4oeQYhD7hUnBIsgrP6WwXTBrI5+6wnxmV2onGblsqy5UBAeNVWTwX31AJSnkmq2erTyclPJtVZyfnfd7P73I9mwPHMVZXuQJPzqhymOH4DN1lbQzrL/Q1rRO8Zh8uzHd9amxZTV1U3L/9m1BC45wo1OJcry7fo3PfRgghZIKHiVP28BoC46DkBgaVmOGHykM9zFJB9BE16JFZCbxerIEnBrioxwyYYfQzHSxaZxtZ/6lp9fRWksAplUESQycsZCYn+aDCoMrV9jLaV9B2Yjku+tjW0o+DEEJKFBhJ+aEOfN+AArKYigjLewnS/zNzC+RUkiNVQjDQ9CeVeFy10jJji1a03dbHPtNY4lWd1NilJyYeDZpYKMSC0l4oQgt2HEQRopIqMBcejp5cvDGRy89j/Ql3HbtUPXqiz0xqFWLxGltLwop3T0IIyXRj3hz7F1WzLGaY3rIUyDV16cfTOpGB/t5bVPmESDqhkiiF+797UCJt6vw7EXjbLt5bzO1QJTkiu0dZCmY6MZNVDa0HCSGElBc8N+U5eoHTtja+phSJArtMcaIuJIHPX8c4PPmcDVvKWrJxjfiXWNt5XWACAF13hqNReU8j/DPwTEfbVKiwwnTiqkQwHkE5YEm6S1mtd0+0BAe86tyG1+nd7fIFE4yuToSD8Tm8ixJCSOBDSTnjvyqzMk1BygsMYEppJpf1QEvqHGXbbww2yYs+wV+YEEJIpQWeUMzJMyxWrJaSAUGoUXAczmR+nTHQkjKh5DNXZPiVeozRVckaD3TxrCvyuWV1UclVHVSt6OSDXR79ieKc07ZxfPR8nnWEEOK9USpTzuhGmMYVy/G5VGDmS6Sd9WhzpruoQMp3Nw0zCSGEEP2sHIz+AOWlMMTOL5iNf1WZa1ewX5PyknH8wc6eTH4tlYqoYE7CmBIlzCeaklWpgFK+bK/CbLY4x1j5qCjT52J5zBFCSNU/jEo5c0QIIYQQQshkQybZfoZOTsVSbwAkjmC4Xy2dZQghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghpHj8P+97YBx020E0AAAAAElFTkSuQmCC`;
}
// PDF: Title
function generatePdfTitle(){
    return {
        image: returnTitleStandardBlonde(),
        width: 400,
        style: 'documentHeaderCenter'
    }
}


// PDF: Header
function generatePdfHeader(email, name, refId){
    var cellWidth = 120;
    return {
        columns: [
            // {
            //     image: returnLogoDabaseUri(),
            //     width: 50
            // },
                
            [
                // {
                //     text: 'Love', 
                //     style: 'invoiceTitle',
                //     width: '*'
                // },
                // {
                //     image: returnLogoDabaseUri(),
                //     width: 70,
                //     alignment:'right',
                //     margin:[0,0,0,2],
                // },
                {
                  stack: [
                    {
                        columns: [
                             {
                                 text:'', 
                                 style:'invoiceSubTitle',
                                 width: '*',
                                 
                             }, 
                             {
                                 text: 'ref. #' + refId,
                                 style:'invoiceSubValue',
                                 width: cellWidth,
                                 
                                 
                             }
                             ]
                    },
                       {
                           columns: [
                                {
                                    text:'e-mail ', 
                                    style:'invoiceSubTitle',
                                    width: '*',
                                    
                                }, 
                                {
                                    text: email,
                                    style:'invoiceSubValue',
                                    width: cellWidth,
                                    
                                    
                                }
                                ]
                       },
                       {
                           columns: [
                               {
                                   text:'填寫日期',
                                   style:'invoiceSubTitle',
                                   width: '*',
                               }, 
                               {
                                   text: getToday(),
                                   style:'invoiceSubValue',
                                   width: cellWidth,
                               }
                               ]
                       },
                       {
                           columns: [
                               {
                                   text:'填寫人暱稱',
                                   style:'invoiceSubTitle',
                                   width: '*',
                               }, 
                               {
                                   text: name,
                                   style:'invoiceSubValue',
                                   width: cellWidth,
                               }
                               ]
                       },
                   ]
                }
            ],
        ],
    }
}

// PDF: Header
function generatePdfSecondPageHeader(email, name){
    return {
        columns: [
            {
                image: returnLogoDabaseUri(),
                width: 150
            },
                
            [
                {
                    text: '問卷內容', 
                    style: 'invoiceTitle',
                    width: '*'
                },
                {
                  stack: [
                       {
                           columns: [
                                {
                                    text:'e-mail #', 
                                    style:'invoiceSubTitle',
                                    width: '*',
                                    color: 'gray'
                                    
                                }, 
                                {
                                    text: email,
                                    style:'invoiceSubValue',
                                    width: 100,
                                    color: 'gray'
                                    
                                }
                                ]
                       },
                       {
                           columns: [
                               {
                                   text:'填寫日期',
                                   style:'invoiceSubTitle',
                                   width: '*',
                                   color: 'gray'
                               }, 
                               {
                                   text: getToday(),
                                   style:'invoiceSubValue',
                                   width: 100,
                                   color: 'gray'
                               }
                               ]
                       },
                       {
                           columns: [
                               {
                                   text:'填寫人暱稱',
                                   style:'invoiceSubTitle',
                                   width: '*',
                                   color: 'gray'
                               }, 
                               {
                                   text: name,
                                   style:'invoiceSubValue',
                                   width: 100,
                                   color: 'gray'
                               }
                               ]
                       },
                   ]
                }
            ],
        ],
    }
}
// PDF: Simple Paragraph
function generatePdfSentence(title, content){
    return {
		italics: false,
		text: [
			{text: " - " + title + "：\n", style: 'itemTitle', bold: true},
			{text: "   " + content+ "\n", style: 'itemContext', bold: false},
			'\n'
		]
	}

}

// PDF: Simple item
function generatePdfItem(title, content){
    return {
		italics: false,
		ul: [
			// {text: title + "：\t", style: [ 'itemsHeader'], bold: true},
			// {text: "   " + content+ "\n", style: 'itemSubTitle', bold: false},
            {text: title + "：\t" + content, style: [ 'itemTitle']},
			// {text: "   " + content+ "\n", style: 'itemSubTitle', bold: false},
		]
	}

}
// PDF: Billing Header
function generatePdfBillHeader(receiverName, receiverAddr){
    return [
        {
	        columns: [
	            // {
	            //     text: '新人',
	            //     style:'invoiceBillingTitle',
	                
	            // },
	            {
	                text: '來賓姓名',
	                style:'invoiceBillingTitle',
	                
	            },
	        ]
	    },
	    // Billing Details
	    {
	        columns: [
	            // {
	            //     text: '影山茂夫/靈幻新隆',
	            //     style: 'invoiceBillingDetails'
	            // },
	            {
	                text: receiverName+'\n',
	                style: 'invoiceBillingDetails'
	            },
	        ]
	    },
	    // Billing Address Title
	    {
	        columns: [
	            // {
	            //     text: '婚禮地址',
	            //     style: 'invoiceBillingAddressTitle'
	            // },
	            {
	                text: '來賓收件地址',
	                style: 'invoiceBillingAddressTitle'
	            },
	        ]
	    },
	    // Billing Address
	    {
	        columns: [
	            // {
	            //     text: '四婁café 幸福廳',
	            //     style: 'invoiceBillingAddress'
	            // },
	            {
	                text: receiverAddr,
	                style: 'invoiceBillingAddress'
	            },
	        ]
	    },
    ]
}
// PDF: Billing Table 
function buildPdfTableBody(data, columns) {
    var body = [];
    var styledColumns = columns.map(column=>{
        return {
            borderColor: ['#ffffff', '#ffffff', '#ffffff', '#bfbfbf'],
            text: column,
        }
    })

    body.push(styledColumns);
    // columns.push(...data);
    var details = data.billData;
    var productPrice = data.total;
    details.forEach(function(row) {
        var dataRow = [];

        columns.forEach(function(column) {
            var cell = {
                borderColor: ['#ffffff', '#ffffff', '#ffffff', '#bfbfbf'],
                fontSize: 9,
                text: row[column],
            }

            dataRow.push(cell);
        })

        body.push(dataRow);
    });
    var row = [
        {text: '',
        border: [false, false, false, false]}, {text: '',
        border: [false, false, false, false]}, {text: '',
        border: [false, false, false, false]}, {text: '',
        border: [false, false, false, false]}
    ]

    body.push(row);

    return body;
}
// PDF: Billing Table BOdy
function buildPdfTable(data, columns) {
    return {
        style: 'tableStyle',
        layout: {
            // fillColor: function (rowIndex, node, columnIndex) {
            //     return (rowIndex === 0) ? '#c2dec2' : null;
            // },
            // hLineColor: function (i, node) {
            //     return (i === 0) ? 'white' : 'white';
            // // },
            // hLineColor: 'white',
            // vLineColor: 'white',
        },
        table: {
            widths: ['25%', '25%', '25%', '25%'],
            heights: 20, 
            headerRows: 1,
            body: buildPdfTableBody(data, columns)
        }
    };
}

function buildPdfTableFooter(productSum, registerFee, finalPrice) {
    return {
        table: {
          // headers are automatically repeated if the table spans over multiple pages
          // you can declare how many rows should be treated as headers
          headerRows: 0,
          widths: [ '*', 80 ],
          borderColor: ['#ffffff', '#ffffff', '#ffffff', '#ffffff'],
          body: [
            // Total
            [ 
                {
                    text:'周邊總價',
                    style:'itemsFooterSubTitle'
                }, 
                { 
                    text: 'NT$ ' + productSum,
                    style:'itemsFooterSubValue'
                }
            ],
            [ 
                {
                    text:'婚禮報名費',
                    style:'itemsFooterSubTitle'
                },
                {
                    text: 'NT$ ' + registerFee,
                    style:'itemsFooterSubValue'
                }
            ],
            [ 
                {
                    text:'= 總費用',
                    style:'itemsFooterTotalTitle'
                }, 
                {
                    text: 'NT$ ' + finalPrice,
                    style:'itemsFooterTotalValue'
                }
            ],
          ]
        }, // table
        layout: 'noBorders', // optional
      };
}

// PDF: Report Note
function buildPdfNote(){
    return [{ 
        text: 'NOTES',
        style:'notesTitle',
        decoration: 'underline',
        decorationColor: 'red',
        color: 'red',
    },
    { 
        text: '此表單僅作為填寫證明，請注意後續有無收到報名匯款通知',
        style:'notesText',
        decoration: 'underline',
        // decorationStyle: 'wavy',
        decorationColor: 'red',
        color: 'red',
    }]
}

function getSectionsItems(){
    return [
        {
            "id": "root",
            "items":[
            {
                // name
                "id": "1439048663",
                "type": "",
                "entryType": "text",
                "entryId": "1068526554",
            },
            {
                // email
                "id": "658159440",
                "entryType": "text",
                "entryId": "883070371",
                "regex": "^(.+)@(.+)$",
                "errorMsg": "請再確認一次信箱格式～"
                
            },
            {
                // 3 digits
                "id": "981692748",
                "entryType": "text",
                "entryId": "1053365713",
                "regex": "^[0-9]{3}$",
                "errorMsg": "格式為三位半形數字喔～"
                
            },
            {
                // addr
                "id": "1686927898",
                "entryType": "text",
                "entryId": "896231682",
                
            },
            {
                // addr receiver
                "id": "1691582630",
                "entryType": "text",
                "entryId": "111610196",
                
            },
            {
                // allergy
                "id": "1043102370",
                "type": "PARAGRAPH_TEXT",
                "entryType": "text",
                "entryId": "1395581871"
                
            },
            {
                // emergency contact
                "id": "1827994924",
                "type": "PARAGRAPH_TEXT",
                "entryType": "text",
                "entryId": "1970291756"
            },
            {
                // 1125
                "id": "929329530",
                "entryType": "radio",
                "entryId": "1841292804"
            },
            {
                // little helper
                "id": "36699560",
                "entryType": "radio",
                "entryId": "1339607071"
            },
            {
                // payment method
                "id": "895429393",
                "entryType": "radio",
                "entryId": "451787920"
            },
            {
                // display title
                "id": "1624480621",
                "entryType": ""
            },
            {
                // product
                "id": "1406572988",
                "entryType": "custom",
            }, 
            {
                // product
                "id": "259046852",
                "entryType": "custom",
            }, 
            {
                // product
                "id": "304960959",
                "entryType": "custom",
            }, 
            {
                // product
                "id": "2051996369",
                "entryType": "custom",
            }, 
            {
                // product
                "id": "1706597056",
                "entryType": "custom",
            }, 
            {
                // product
                "id": "901430140",
                "entryType": "custom",
            }, 
            {
                // display: 文字
                "id": "985712023",
                "entryType": ""
            }, 
            {   //product
                "id": "1121831062",
                "entryType": "custom",
            }, 
            {
                // display: product total price
                "id": "2046362136",
                "entryType": "bill-display",
                "entryId": "575052231"
            }, 
            {
               // display: product total quantity
                "id": "2139224654",
                "entryType": "bill-display",
                "entryId": "253014823"
            }, 
            {
                // display: register fee
                "id": "855092565",
                "entryType": "",
                "entryId": "1423911485"
            }, 
            {
                // display: sum 
                "id": "1588677463",
                "entryType": "bill-display",
                "entryId": "1725694623"
            }, 
            {
                // display: bill
                "id": "1959728480",
                "entryType": ""
            },]
        },
        {
            "id": "1194002809",
            "items":[ 
            {
                // I/E 
                "id": "218713257",
                "entryType": "radio",
                "entryId": "18356239"
            }, 
            {
                // rule: no food
                "id": "964519823",
                "entryType": "radio",
                "entryId": "1286001326"
            }, 
            {
                // with friends
                "id": "1226046570",
                "entryType": "text",
                "entryId": "1032881495"
            }, 
            {
                 // rule: with cosers
                "id": "368266770",
                "entryType": "radio",
                "entryId": "746776974"
            }, 
            {
                 // mobrei doll
                "id": "957187906",
                "entryType": "radio",
                "entryId": "450550785"
            }, 
            {
                // bring ID cards
               "id": "1565424873",
               "entryType": "radio",
               "entryId": "63787071"
              }, 
            {
                // information done
                "id": "1666827740",
                "entryType": "radio",
                "entryId": "1160286542"
            }, 
            {   
                // note: wishes
                "id": "780521456",
                "entryType": "text",
                "entryId": "189841679"
            }, 
            {   
                // note: Q or thoughts
                "id": "1388002876",
                "entryType": "text",
                "entryId": "653167275"
            }, 
            {
                // note: to the team
                "id": "1496947901",
                "entryType": "text",
                "entryId": "713268329"
            }]
         },
         {
             "id": "ending",
             "items":[]
          }
        
    ]
}

function getData(){
  var sections = getSectionsItems();
  dataSet = {};
  sections.forEach(section=>{
    var items = section.items;
    items.forEach(item=>{
        var name = "entry." + item.entryId;
       
        var value = "";
        if(item.entryType=="radio"){
            var checkeVal = function() {
                var v;
                $(`[name="${name}"]`).each(function() {
                    if($(this).prop('checked') === true) {
                        v = $(this).val();
                        if(v==="__other_option__"){
                            dataSet[`${name}.other_option_response`] = $(`input[name="${name}.other_option_response"]`).val();
                        }
                    }
                });
                return v;
            };
            value = checkeVal();
        }else if(item.entryType=="custom"){
            value = product_data[item.id].quantity;
            name = product_data[item.id].quantity_id
            
        }else if(item.entryType=="bill-display"){
            value = $(`#Display${item.id}`).val() || 0;
        }
        else {
            value = $(`[name="${name}"]`).val() || '';
        }
        dataSet[name] = value;

    })
  })
  dataSet['pageHistory'] = '0,1';
  return dataSet;
}
function getUserEmail(){
    var email = document.getElementById('Widget658159440').value;
    return email;
}
