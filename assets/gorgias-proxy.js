"use strict";
if(debug) console.log("Gorgias proxy loaded");

const gorgiasUrl = 'https://config.gorgias.chat/gorgias-chat-bundle-loader.js?applicationId=4232';

window.addEventListener("load", async () => {
    await loadScript(gorgiasUrl);
    if(debug) console.log("Gorgias library added");
    
    const brandName = 'CALPAK'
    const privacyPolicyLink = 'https://www.calpaktravel.com/policies/privacy-policy'
    const introMessage = `By using this chat feature, you consent to the recording and use of information about you and this chat session by ${brandName} or any authorized service provider acting solely on ${brandName}’s behalf. ${brandName} may use or disclose this information in accordance with its <a href="${privacyPolicyLink}" target="_blank">Privacy Policy<a>. If you do not consent to these terms, please do not use this chat feature and reach out to us via email or by phone. Your continued interaction with, or submission of information to, this chat feature will be deemed to be your acceptance of ${brandName}’s`

    GorgiasChat.init().then((GorgiasChat) => {
        GorgiasChat.updateTexts({
            "requireEmailCaptureIntro": "Hey there! " + introMessage,
            "contactFormIntro": "Hey there! " + introMessage,
            "contactFormSSPUnsuccessfulAskAdditionalMessage": "Hey there! " + introMessage,
            "waitTimeLongNoEmail": "Thank you for your patience. " + introMessage,
            "waitTimeMediumNoEmail": "Thanks for reaching out! Leave us your email and an agent will get back to you in about {waitTime} minutes. " + introMessage,
            "waitTimeShortNoEmail": "Thanks for reaching out! " + introMessage
        })

        GorgiasChat.updateSSPTexts({
            "sorryToHearThatEmailRequired": introMessage
        })
    })
});