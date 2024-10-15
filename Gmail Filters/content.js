function runMyScript() {



    // COLLECT ALL SELECTED EMAILS FROM GMAIL INBOX

    let newArray = [];

    document.querySelectorAll(`div[aria-checked="true"][role="checkbox"]`).forEach(e => {
        newArray.push(e.parentNode.parentNode.querySelector(`td.yX.xY [email*="@"]`).getAttribute("email"))
        // e.parentNode.parentNode.querySelector(`td.yX.xY [email*="@"]`).getAttribute("email")
    })

    console.log(newArray);
    console.log(newArray.join(" OR "));

    //if new array is empty, then alert the user
    if (newArray.length == 0) {
        alert("No emails selected. Please select emails and try again.")
    }
    else {

        // CREATE NEW GMAIL FILTER

        // OPEN GMAIL FILTERS PAGE
        document.querySelector(`button[aria-label="Advanced search options"]`).click()

        // WAIT FOR THE PAGE TO LOAD
        setTimeout(() => {
            // ADD ALL COLLECTED EMAILS TO THE FILTER
            // document.getElementById(`:pg`).value = newArray.join(" OR ")
            document.querySelector(`.SK.ZF-zT > .ZZ .w-Pv input.ZH.nr.aQa`) ? document.querySelector(`.SK.ZF-zT > .ZZ .w-Pv input.ZH.nr.aQa`).value = newArray.join(" OR ") : document.querySelector(`.SK.ZF-zT > .ZZ .w-Pv input.ZH.nr.aQa`)[1].value = newArray.join(" OR ");
            // document.querySelector(`.SK.ZF-zT > .ZZ .w-Pv input.ZH.nr.aQa`).value = newArray.join(" OR ")

            

            // WAIT FOR THE PAGE TO LOAD & CLICK ON CREATE FILTER BUTTON
            setTimeout(() => {
                document.querySelector(`.acM[role="link"]`).click()

                // PREFILL IMPORTANT PARAMETERS OF THE FILTER

                // wait for the page to load
                setTimeout(() => {

                    // CECK THE BOX TO APPLY THE FILTER TO EXISTING CONVERSATIONS
                    document.querySelector(`.btl.ZQ input.btj`).click()

                    // NEVER SEND TO SPAM
                    document.querySelector(`div:nth-child(7).nH.lZ > label`).click()

                    // SKIP THE INBOX
                    document.querySelector(`div:nth-child(1).nH.lZ > label`).click()

                    // APPLY THE LABEL
                    document.querySelector(`div:nth-child(4).nH.lZ > label`).click()

                    // HIGHLIGHT THE LABEL SECTION SO USER CAN PICK
                    document.querySelector(".T-axO.T-I.T-I-ax7.J-J5-Ji.J-JN-M-I.ZE").style.border = "solid 3px orange";
                    document.querySelector(".T-axO.T-I.T-I-ax7.J-J5-Ji.J-JN-M-I.ZE").style.borderRadius = "7px";
                    document.querySelector(".T-axO.T-I.T-I-ax7.J-J5-Ji.J-JN-M-I.ZE").style.padding = "3px";

                    // ADD AN ARROW POINTING TO THE LABEL SECTION
                    document.querySelector(".T-axO.T-I.T-I-ax7.J-J5-Ji.J-JN-M-I.ZE > div").insertAdjacentHTML("afterend", `<div style="position: absolute; top: 0; right: -20px; width: 0; height: 0; border-top: 10px solid transparent; border-bottom: 10px solid transparent; border-right: 10px solid orange;"></div>`)
                    // ADD SOME TEXT NEXT TO THE ARROW
                    document.querySelector(".T-axO.T-I.T-I-ax7.J-J5-Ji.J-JN-M-I.ZE > div").insertAdjacentHTML("afterend", `<div style="position: absolute; top: 0; right: -50px; width: 0; height: 0; border-top: 0px solid transparent; border-bottom: 10px solid transparent; color:orange; border-right: 10px solid white;">Pick a label to keep organised (recommended)</div>`)

                }, 1500)


            }, 700)





        }, 1000)




    }
}



// Add this event listener at the end of content.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.toggle) {
        runMyScript();
    }
});