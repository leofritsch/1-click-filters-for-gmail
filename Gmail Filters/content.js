// Gmail Filters Chrome Extension - Enhanced Version
// Provides 1-click filter creation with improved UX and error handling

class GmailFilterCreator {
    constructor() {
        this.selectedEmails = [];
        this.modal = null;
        this.filterButton = null;
        this.isProcessing = false;
        
        // Initialize the extension
        this.init();
    }

    /**
     * Initialize the extension by setting up observers and UI elements
     */
    init() {
        this.waitForGmailToLoad(() => {
            this.setupSelectionObserver();
            this.addStyles();
        });
    }

    /**
     * Wait for Gmail interface to fully load before initializing
     */
    waitForGmailToLoad(callback) {
        const checkGmailLoaded = () => {
            if (document.querySelector('[role="main"]') && document.querySelector('table[role="grid"]')) {
                callback();
            } else {
                setTimeout(checkGmailLoaded, 500);
            }
        };
        checkGmailLoaded();
    }

    /**
     * Add CSS styles for the modal and button
     */
    addStyles() {
        if (document.getElementById('gmail-filter-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'gmail-filter-styles';
        styles.textContent = `
            .gmail-filter-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                z-index: 999999;
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: 'Google Sans', Roboto, Arial, sans-serif;
            }
            
            .gmail-filter-content {
                background: white;
                border-radius: 8px;
                padding: 24px;
                max-width: 500px;
                width: 90%;
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
                position: relative;
            }
            
            .gmail-filter-header {
                display: flex;
                align-items: center;
                margin-bottom: 16px;
            }
            
            .gmail-filter-icon {
                width: 24px;
                height: 24px;
                margin-right: 12px;
                background: #ffcc70;
                border-radius: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
            }
            
            .gmail-filter-title {
                font-size: 18px;
                font-weight: 500;
                color: #202124;
            }
            
            .gmail-filter-progress {
                margin: 16px 0;
            }
            
            .gmail-filter-progress-bar {
                width: 100%;
                height: 4px;
                background: #f1f3f4;
                border-radius: 2px;
                overflow: hidden;
            }
            
            .gmail-filter-progress-fill {
                height: 100%;
                background: #1a73e8;
                transition: width 0.3s ease;
                border-radius: 2px;
            }
            
            .gmail-filter-status {
                margin-top: 8px;
                color: #5f6368;
                font-size: 14px;
            }
            
            .gmail-filter-button {
                background: #ffcc70;
                color: #202124;
                border: none;
                border-radius: 4px;
                padding: 8px 16px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
                margin: 4px;
                display: inline-flex;
                align-items: center;
                transition: background-color 0.2s;
            }
            
            .gmail-filter-button:hover {
                background:rgb(252, 191, 78);
            }
            
            .gmail-filter-button:disabled {
                background: #f1f3f4;
                color: #9aa0a6;
                cursor: not-allowed;
            }

            .gmail-filter-toolbar-button {
                border-radius: 12px;
                background: #ffcc70;
                padding: 2px;
                transition: background-color 0.2s;
            }
            .gmail-filter-toolbar-button:hover {
                background:rgb(248, 188, 75);
            }
            
            .gmail-filter-close {
                position: absolute;
                top: 12px;
                right: 12px;
                background: none;
                border: none;
                font-size: 20px;
                cursor: pointer;
                color: #5f6368;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .gmail-filter-error {
                background: #fce8e6;
                color: #d93025;
                padding: 12px;
                border-radius: 4px;
                margin: 12px 0;
                font-size: 14px;
            }
            
            .gmail-filter-success {
                background: #e8f5e8;
                color: #137333;
                padding: 12px;
                border-radius: 4px;
                margin: 12px 0;
                font-size: 14px;
            }

            @keyframes shimmer {
                0% {
                    background-position: 200% 0;
                }
                100% {
                    background-position: -200% 0;
                }
            }
            .shimmer {
                animation: shimmer 1.5s infinite;
                background: transparent;
                background: linear-gradient(90deg, #f0f0f0 25%,rgb(255, 143, 32) 50%, #f0f0f0 75%);
                background-size: 200% 100%;
                // border-radius: 12px;
            }
        `;
        document.head.appendChild(styles);
    }

    /**
     * Set up observer to watch for email selection changes
     */
    setupSelectionObserver() {
        const observer = new MutationObserver(() => {
            this.handleSelectionChange();
        });

        // Observe the entire Gmail interface for changes
        const targetNode = document.querySelector('[role="main"]');
        if (targetNode) {
            observer.observe(targetNode, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['aria-checked']
            });
        }

        // Initial check
        this.handleSelectionChange();
    }

    /**
     * Handle selection changes and show/hide the filter button
     */
    handleSelectionChange() {
        const selectedCheckboxes = document.querySelectorAll('div[aria-checked="true"][role="checkbox"]');
        
        if (selectedCheckboxes.length > 0) {
            this.showFilterButton();
        } else {
            this.hideFilterButton();
        }
    }

    /**
     * Show the filter button in Gmail's toolbar
     */
    showFilterButton() {
        if (this.filterButton) return;

        // // Find Gmail's toolbar - this might need adjustment based on Gmail's current structure
        // const toolbar = document.querySelector('.ar9.T-I-J3.J-J5-Ji') || 
        //                 document.querySelector('.G-atb') || 
        //                 document.querySelector('[data-tooltip="Archive"]')?.parentElement;
        
        const toolbarelements = document.querySelectorAll('.G-tF .G-Ni.J-J5-Ji');
        const toolbar = toolbarelements[toolbarelements.length - 1];



        if (toolbar) {
            this.filterButton = document.createElement('div');
            this.filterButton.className = 'gmail-filter-toolbar-button';
            this.filterButton.innerHTML = `<div id=":24" class="T-I J-J5-Ji nf T-I-ax7 L3 gmail-filter-toolbar-button" id="" role="button" tabindex="0" aria-label="1 Click Filters" aria-haspopup="false" aria-expanded="false" data-tooltip="1 Click Filters" ><div class="asa"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-funnel-plus-icon lucide-funnel-plus"><path d="M13.354 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14v6a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341l1.218-1.348"></path><path d="M16 6h6"></path><path d="M19 3v6"></path></svg>
</div><div class="G-asx T-I-J3 J-J5-Ji">&nbsp;</div></div>`;
            this.filterButton.title = 'Create Gmail filter for selected emails';
            this.filterButton.onclick = () => this.startFilterCreation();

//             let filterButtonHTML = `
//             <div id=":24" class="T-I J-J5-Ji nf T-I-ax7 L3 gmail-filter-toolbar-button" id="" role="button" tabindex="0" aria-label="1 Click Filters" aria-haspopup="false" aria-expanded="false" data-tooltip="1 Click Filters" style="border-radius: 12px;background: orange;padding: 2px;user-select: none;"><div class="asa"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-funnel-plus-icon lucide-funnel-plus"><path d="M13.354 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14v6a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341l1.218-1.348"></path><path d="M16 6h6"></path><path d="M19 3v6"></path></svg>
// </div><div class="G-asx T-I-J3 J-J5-Ji">&nbsp;</div></div>` 

            // const filterButtonElement = document.createElement('div');
            // filterButtonElement.innerHTML = filterButtonHTML;
            // toolbar.appendChild(filterButtonElement.firstElementChild);

            toolbar.appendChild(this.filterButton);

            // query selector the button + add the class shimmer for a quick shimmer on show up
            const button = document.querySelector('.gmail-filter-toolbar-button');
            button.classList.add('shimmer');
            setTimeout(() => {
                button.classList.remove('shimmer');
            }, 1000);
        }
    }

    /**
     * Hide the filter button
     */
    hideFilterButton() {
        if (this.filterButton) {
            this.filterButton.remove();
            this.filterButton = null;
        }
    }

    /**
     * Start the filter creation process
     */
    async startFilterCreation() {
        if (this.isProcessing) return;

        try {
            this.isProcessing = true;
            this.selectedEmails = this.collectSelectedEmails();
            
            if (this.selectedEmails.length === 0) {
                alert('No emails selected. Please select emails and try again.');
                return;
            }

            this.showModal();
            await this.createFilter();
            
        } catch (error) {
            console.error('Filter creation failed:', error);
            this.closeModal();
            // Try to inject error into Gmail interface, fall back to alert if not possible
            setTimeout(() => {
                const targetContainer = document.querySelector('.ZF-Av .ZZ');
                if (targetContainer) {
                    this.injectMessageIntoGmail(`Filter creation failed: ${error.message}. Please try again or create the filter manually.`, 'error');
                } else {
                    alert(`Filter creation failed: ${error.message}`);
                }
            }, 500);
        } finally {
            this.isProcessing = false;
        }
    }

    /**
     * Collect email addresses from selected emails
     */
    collectSelectedEmails() {
        const emails = [];
        const selectedCheckboxes = document.querySelectorAll('div[aria-checked="true"][role="checkbox"]');
        
        selectedCheckboxes.forEach(checkbox => {
            try {
                const emailElement = checkbox.closest('tr')?.querySelector('[email*="@"]') ||
                                   checkbox.parentNode?.parentNode?.querySelector('td.yX.xY [email*="@"]');
                
                if (emailElement) {
                    const email = emailElement.getAttribute('email');
                    if (email && !emails.includes(email)) {
                        emails.push(email);
                    }
                }
            } catch (error) {
                console.warn('Failed to extract email from checkbox:', error);
            }
        });
        
        return emails;
    }

    /**
     * Show modal with progress updates
     */
    showModal() {
        this.modal = document.createElement('div');
        this.modal.className = 'gmail-filter-modal';
        this.modal.innerHTML = `
            <div class="gmail-filter-content">
                <button class="gmail-filter-close">&times;</button>
                <div class="gmail-filter-header">
                    <div class="gmail-filter-icon">🔍</div>
                    <div class="gmail-filter-title">Creating Gmail Filter</div>
                </div>
                <div class="gmail-filter-progress">
                    <div class="gmail-filter-progress-bar">
                        <div class="gmail-filter-progress-fill" style="width: 0%"></div>
                    </div>
                    <div class="gmail-filter-status">Preparing to create filter for ${this.selectedEmails.length} sender(s)...</div>
                </div>
                <div style="margin-top: 16px;">
                    <button class="gmail-filter-button" onclick="window.open('${chrome.runtime.getURL('explainer.html')}', '_blank')">
                        📖 How it works
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(this.modal);
        
        // Add close functionality
        const closeButton = this.modal.querySelector('.gmail-filter-close');
        closeButton.onclick = () => {
            this.closeModal();
        };
    }

    /**
     * Close the modal
     */
    closeModal() {
        if (this.modal) {
            this.modal.remove();
            this.modal = null;
        }
    }

    /**
     * Update modal progress
     */
    updateProgress(percent, status) {
        if (!this.modal) return;
        
        const progressFill = this.modal.querySelector('.gmail-filter-progress-fill');
        const statusElement = this.modal.querySelector('.gmail-filter-status');
        
        if (progressFill) progressFill.style.width = `${percent}%`;
        if (statusElement) statusElement.textContent = status;
    }

    /**
     * Create the Gmail filter
     */
    async createFilter() {
        try {
            this.updateProgress(20, 'Opening advanced search...');
            
            // Open advanced search
            const searchButton = document.querySelector('button[aria-label="Advanced search options"]') ||
                                document.querySelector('[aria-label="Show search options"]');
            
            if (!searchButton) {
                throw new Error('Could not find advanced search button. Please make sure you are in Gmail inbox.');
            }
            
            searchButton.click();
            await this.wait(1000);
            
            this.updateProgress(40, 'Filling in email addresses...');
            
            // Fill in the from field
            const fromField = document.querySelector('.SK.ZF-zT > .ZZ .w-Pv input.ZH.nr.aQa') ||
                             document.querySelector('input[name="cf1_from"]') ||
                             document.querySelector('input[aria-label="From"]');
            
            if (!fromField) {
                throw new Error('Could not find the "From" field in advanced search. Gmail interface may have changed.');
            }
            
            fromField.value = this.selectedEmails.join(' OR ');
            fromField.dispatchEvent(new Event('input', { bubbles: true }));
            
            this.updateProgress(60, 'Creating filter...');
            await this.wait(1000);
            
            // Click create filter
            const createFilterButton = document.querySelector('.acM[role="link"]') ||
                                      document.querySelector('div[role="link"]:contains("Create filter")') ||
                                      document.querySelector('[data-tooltip*="filter"]');
            
            if (!createFilterButton) {
                throw new Error('Could not find "Create filter" button. Please try again.');
            }
            
            createFilterButton.click();
            await this.wait(1500);
            
            this.updateProgress(80, 'Configuring filter settings...');
            
            // Configure filter settings
            await this.configureFilterSettings();
            
            // Filter configuration is complete - modal and messages are handled in configureFilterSettings
            
        } catch (error) {
            console.error('Filter creation error:', error);
            throw error;
        }
    }

    /**
     * Configure filter settings (apply to existing conversations, never spam, skip inbox, apply label)
     */
    async configureFilterSettings() {
        let configurationsApplied = 0;
        const totalConfigurations = 4;
        
        try {
            // Apply to existing conversations
            const applyExistingCheckbox = document.querySelector('.btl.ZQ input.btj') ||
                                         document.querySelector('input[type="checkbox"][name*="existing"]') ||
                                         this.findElementByText('input[type="checkbox"]', 'existing', 'parent');
            if (applyExistingCheckbox && !applyExistingCheckbox.checked) {
                applyExistingCheckbox.click();
                await this.wait(200);
                configurationsApplied++;
            }
            
            // Never send to spam - find by text content
            const neverSpamLabel = document.querySelector('div:nth-child(7).nH.lZ > label') ||
                                  this.findElementByText('label', 'Never send it to Spam') ||
                                  this.findElementByText('label', 'spam');
            if (neverSpamLabel) {
                const checkbox = neverSpamLabel.querySelector('input[type="checkbox"]') || neverSpamLabel.previousElementSibling;
                if (checkbox && !checkbox.checked) {
                    neverSpamLabel.click();
                    await this.wait(200);
                    configurationsApplied++;
                }
            }
            
            // Skip inbox - find by text content
            const skipInboxLabel = document.querySelector('div:nth-child(1).nH.lZ > label') ||
                                  this.findElementByText('label', 'Skip the Inbox') ||
                                  this.findElementByText('label', 'skip');
            if (skipInboxLabel) {
                const checkbox = skipInboxLabel.querySelector('input[type="checkbox"]') || skipInboxLabel.previousElementSibling;
                if (checkbox && !checkbox.checked) {
                    skipInboxLabel.click();
                    await this.wait(200);
                    configurationsApplied++;
                }
            }
            
            // Apply label - find by text content
            const applyLabelCheckbox = document.querySelector('div:nth-child(4).nH.lZ > label') ||
                                      this.findElementByText('label', 'Apply the label') ||
                                      this.findElementByText('label', 'label');
            if (applyLabelCheckbox) {
                const checkbox = applyLabelCheckbox.querySelector('input[type="checkbox"]') || applyLabelCheckbox.previousElementSibling;
                if (checkbox && !checkbox.checked) {
                    applyLabelCheckbox.click();
                    await this.wait(200);
                    configurationsApplied++;
                }
            }
            
            // Highlight label selector
            const labelSelector = document.querySelector('.T-axO.T-I.T-I-ax7.J-J5-Ji.J-JN-M-I.ZE') ||
                                 document.querySelector('[data-tooltip*="Choose label"]') ||
                                 this.findElementByText('button', 'Choose label') ||
                                 this.findElementByText('div', 'Choose label');
            
            if (labelSelector) {
                labelSelector.style.border = 'solid 3px #ea4335';
                labelSelector.style.borderRadius = '7px';
                labelSelector.style.padding = '3px';
                labelSelector.style.position = 'relative';
                
                // Add pointer and text
                const pointer = document.createElement('div');
                pointer.style.cssText = `
                    position: absolute;
                    top: 50%;
                    right: -20px;
                    transform: translateY(-50%);
                    width: 0;
                    height: 0;
                    border-top: 10px solid transparent;
                    border-bottom: 10px solid transparent;
                    border-right: 10px solid #ea4335;
                `;
                labelSelector.appendChild(pointer);
                
                const text = document.createElement('div');
                text.style.cssText = `
                    position: absolute;
                    top: 50%;
                    right: -30px;
                    transform: translateY(-50%);
                    width: 0px;
                    color: #ea4335;
                    font-weight: 500;
                    white-space: nowrap;
                    font-size: 14px;
                `;
                text.textContent = 'Pick a label to keep organized (recommended)';
                labelSelector.appendChild(text);
            }
            
            // Close modal and show message in Gmail interface
            this.closeModal();
            
            // Show appropriate message based on how many configurations were applied
            if (configurationsApplied < totalConfigurations) {
                this.injectMessageIntoGmail(`I was able to configure ${configurationsApplied} out of ${totalConfigurations} settings automatically. Please review and adjust the remaining checkboxes as needed, then click "Create Filter" to complete the process.`, 'partial');
            } else {
                this.injectMessageIntoGmail('All recommended settings have been applied automatically. Choose a label below and click "Create Filter" to complete the process.', 'success');
            }
            
        } catch (error) {
            console.warn('Some filter settings could not be configured:', error);
            this.closeModal();
            this.injectMessageIntoGmail('Please review the filter settings and check the boxes for your preferences (recommended: Skip Inbox, Never Spam, Apply to existing conversations, and choose a label), then click "Create Filter".', 'partial');
        }
    }

    /**
     * Inject message directly into Gmail's filter interface
     */
    injectMessageIntoGmail(message, type = 'success') {
        // Wait a moment for Gmail's interface to be ready
        setTimeout(() => {
            const targetContainer = document.querySelector('.ZF-Av .ZZ');
            
            if (targetContainer) {
                // Remove any existing messages
                const existingMessage = targetContainer.querySelector('.gmail-filter-inline-message');
                if (existingMessage) {
                    existingMessage.remove();
                }
                
                // Create message element
                const messageDiv = document.createElement('div');
                messageDiv.className = 'gmail-filter-inline-message';
                
                // Set colors based on message type
                let backgroundColor, borderColor, icon;
                if (type === 'success') {
                    backgroundColor = '#fff8e1';
                    borderColor = '#ffcc02';
                    icon = '✅';
                } else if (type === 'error') {
                    backgroundColor = '#fce8e6';
                    borderColor = '#d93025';
                    icon = '❌';
                } else { // partial
                    backgroundColor = '#fff3cd';
                    borderColor = '#ffeaa7';
                    icon = '⚠️';
                }
                const textColor = '#333';
                
                messageDiv.style.cssText = `
                    background: ${backgroundColor};
                    border: 2px solid ${borderColor};
                    border-radius: 12px;
                    padding: 16px;
                    margin-bottom: 16px;
                    color: ${textColor};
                    font-family: 'Google Sans', Roboto, Arial, sans-serif;
                    font-size: 14px;
                    line-height: 1.4;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                `;
                
                // Add icon and text
                messageDiv.innerHTML = `
                    <div style="display: flex; align-items: flex-start; gap: 12px;">
                        <div style="font-size: 18px;">${icon}</div>
                        <div style="flex: 1;">
                            <strong style="display: block; margin-bottom: 4px;">1 Click Filter for Gmail</strong>
                            ${message}
                        </div>
                    </div>
                `;
                
                // Insert as first child
                targetContainer.insertBefore(messageDiv, targetContainer.firstChild);
                
                
                
            } else {
                console.warn('Could not find Gmail filter container to inject message');
            }
        }, 500);
    }

    /**
     * Helper function to find elements by text content
     */
    findElementByText(selector, text, searchScope = 'element') {
        const elements = document.querySelectorAll(selector);
        for (let element of elements) {
            const elementText = element.textContent.toLowerCase();
            const searchText = text.toLowerCase();
            
            if (elementText.includes(searchText)) {
                if (searchScope === 'parent') {
                    return element.closest('label') || element.parentElement;
                }
                return element;
            }
        }
        return null;
    }

    /**
     * Wait for specified milliseconds
     */
    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize the Gmail Filter Creator
let gmailFilterCreator;

// Wait for page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        gmailFilterCreator = new GmailFilterCreator();
    });
} else {
    gmailFilterCreator = new GmailFilterCreator();
}

// Handle messages from background script (for backwards compatibility)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.toggle && gmailFilterCreator) {
        gmailFilterCreator.startFilterCreation();
    }
});