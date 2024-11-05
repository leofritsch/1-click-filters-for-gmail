console.log("Background script running...");
function executeContentScript(tab) {
  console.log("Trigger content script...", tab);
  chrome.tabs.sendMessage(tab.id, { toggle: true });
}

if (chrome.action && chrome.action.onClicked) {
  // Manifest V3
  const gmail = "https://mail.google.com/";
  chrome.action.onClicked.addListener(async (tab) => {
    console.log("onClicked...", tab);
    if (tab.url.startsWith(gmail)) {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          function: runMyScript,
        });
      });
    }
  });
  // chrome.action.onClicked.addListener(executeContentScript);
} else if (chrome.browserAction && chrome.browserAction.onClicked) {
  // Manifest V2
  chrome.browserAction.onClicked.addListener(executeContentScript);
}

function runMyScript() {
  function removeDuplicates(arr) {
    let set = new Set();

    // Adding elements to LinkedHashSet
    for (let i = 0; i < arr.length; i++) {
      set.add(arr[i]);
    }

    return Array.from(set);
  }

  console.log("Running script...");

  // COLLECT ALL SELECTED EMAILS FROM GMAIL INBOX

  let newArray = [];

  document
    .querySelectorAll(`div[aria-checked="true"][role="checkbox"]`)
    .forEach((e) => {
      newArray.push(
        e.parentNode.parentNode
          .querySelector(`td.yX.xY [email*="@"]`)
          .getAttribute("email")
      );
      // e.parentNode.parentNode.querySelector(`td.yX.xY [email*="@"]`).getAttribute("email")
    });

  newArray = removeDuplicates(newArray);

  console.log(newArray);
  console.log(newArray.join(" OR "));

  try {
    //if new array is empty, then alert the user
    if (newArray.length == 0) {
      alert("No emails selected. Please select emails and try again.");
    } else {
      // CREATE NEW GMAIL FILTER

      // OPEN GMAIL FILTERS PAGE
      document
        .querySelector(`button[aria-label="Advanced search options"]`)
        .click();

      // WAIT FOR THE PAGE TO LOAD
      setTimeout(() => {
        // ADD ALL COLLECTED EMAILS TO THE FILTER
        // document.getElementById(`:pg`).value = newArray.join(" OR ")
        document.querySelector(`.SK.ZF-zT > .ZZ .w-Pv input.ZH.nr.aQa`)
          ? (document.querySelector(
              `.SK.ZF-zT > .ZZ .w-Pv input.ZH.nr.aQa`
            ).value = newArray.join(" OR "))
          : (document.querySelector(
              `.SK.ZF-zT > .ZZ .w-Pv input.ZH.nr.aQa`
            )[1].value = newArray.join(" OR "));
        // document.querySelector(`.SK.ZF-zT > .ZZ .w-Pv input.ZH.nr.aQa`).value = newArray.join(" OR ")

        newArray = [];

        // WAIT FOR THE PAGE TO LOAD & CLICK ON CREATE FILTER BUTTON
        setTimeout(() => {
          document.querySelector(`.acM[role="link"]`).click();

          // PREFILL IMPORTANT PARAMETERS OF THE FILTER

          // wait for the page to load
          setTimeout(() => {
            // CHECK THE BOX TO APPLY THE FILTER TO EXISTING CONVERSATIONS
            try {
              document.querySelector(`.btl.ZQ input.btj`).click();
            } catch (error) {
              console.log(
                "Unable to check the box to apply the filter to existing conversations"
              );
              newArray = [];
              console.log("Cleaning up...");
              console.log("Return early...");
              return;
            }

            // NEVER SEND TO SPAM
            try {
              let spamLabel = document
                .evaluate(
                  "//label[text()='Never send it to Spam']",
                  document,
                  null,
                  XPathResult.UNORDERED_NODE_ITERATOR_TYPE,
                  null
                )
                .iterateNext();
              spamLabel.click();
            } catch (error) {
              console.log("No never send to spam option");
              newArray = [];
              console.log("Cleaning up...");
              console.log("Return early...");
              return;
            }

            // SKIP THE INBOX
            try {
              let archiveLabel = document
                .evaluate(
                  "//label[contains(text(),'Skip the Inbox')]",
                  document,
                  null,
                  XPathResult.UNORDERED_NODE_ITERATOR_TYPE,
                  null
                )
                .iterateNext();
              archiveLabel.click();
            } catch (error) {
              console.log(error);
              console.log("Unable to check skip the inbox");
              newArray = [];
              console.log("Cleaning up...");
              console.log("Return early...");
              return;
            }

            // APPLY THE LABEL
            try {
              let applyLabel = document
                .evaluate(
                  "//label[contains(text(),'Apply the label')]",
                  document,
                  null,
                  XPathResult.UNORDERED_NODE_ITERATOR_TYPE,
                  null
                )
                .iterateNext();
              applyLabel.click();
            } catch (error) {
              console.log("Unable to apply the label");
              newArray = [];
              console.log("Cleaning up...");
              console.log("Return early...");
              return;
            }

            // HIGHLIGHT THE LABEL SECTION SO USER CAN PICK
            document.querySelector(
              ".T-axO.T-I.T-I-ax7.J-J5-Ji.J-JN-M-I.ZE"
            ).style.border = "solid 3px orange";
            document.querySelector(
              ".T-axO.T-I.T-I-ax7.J-J5-Ji.J-JN-M-I.ZE"
            ).style.borderRadius = "7px";
            document.querySelector(
              ".T-axO.T-I.T-I-ax7.J-J5-Ji.J-JN-M-I.ZE"
            ).style.padding = "3px";

            // ADD AN ARROW POINTING TO THE LABEL SECTION
            document
              .querySelector(".T-axO.T-I.T-I-ax7.J-J5-Ji.J-JN-M-I.ZE > div")
              .insertAdjacentHTML(
                "afterend",
                `<div style="position: absolute; top: 0; right: -20px; width: 0; height: 0; border-top: 10px solid transparent; border-bottom: 10px solid transparent; border-right: 10px solid orange;"></div>`
              );
            // ADD SOME TEXT NEXT TO THE ARROW
            document
              .querySelector(".T-axO.T-I.T-I-ax7.J-J5-Ji.J-JN-M-I.ZE > div")
              .insertAdjacentHTML(
                "afterend",
                `<div style="position: absolute; top: 0; right: -50px; width: 0; height: 0; border-top: 0px solid transparent; border-bottom: 10px solid transparent; color:orange; border-right: 10px solid white;">Pick a label to keep organised (recommended)</div>`
              );
          }, 1500);
        }, 700);
      }, 1000);
    }
  } catch (error) {
    newArray = [];
    console.log("Cleaning up...");
    throw error;
  }
}
