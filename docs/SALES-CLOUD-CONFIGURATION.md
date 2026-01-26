## Salesforce Standard Sales Cloud configuration

Unmanaged package with all necessary configurations necessary to complete the Sales Cloud Standard configuration we offer to customers

## Configuration attributes included in package

Please check manifest file for complete list

## Instructions for deployment

1. In production go to setup -> Add German as supported Language and add the Kerun user to the eligible users
2. Enable Account Team & set true both checkboxes when prompted
3. Enable Opportunity Team & set true both checkboxes when prompted
4. Deploy manifest in production before creating sandboxes


## Post Installation steps - manual configuration steps

1. Change name of Custom Console Sales Application [Kerun Custom Sales Console] to the name of the customer
2. Assign Profiles to Custom Application
3. Change branding of Custom Sales Application from the default branding scheme and activate
4. Complete all necessary branding configurations for the ORG [e.g Page Background Image, Default Group Banner, Default User Profile Banner]
5. Check translations on the custom labels [change them if needed] and add new ones if needed
6. Adjust configuration on additional objects [e.g Order, OrderLineItem, SBQQ_Quote__c]
7. Translations for path assistant standard steps
    - Lead / Opportunity [text below, in same order as required in the translation configuration within SF]

<p><b style="font-family: Arial; font-size: 10pt;">Übermitteln Sie Ihre Lösung an die Beteiligten.</b></p><p><br></p><ul><li><span style="font-family: Arial; font-size: 10pt;">Kommunizieren Sie den Wert Ihrer Lösungen</span></li><li><span style="font-family: Arial; font-size: 10pt;">Legen Sie den Zeitplan und das Budget fest</span></li><li><span style="font-family: Arial; font-size: 10pt;">Legen Sie gemeinsam mit dem Kunden einen Plan fest, wann und wie Sie das Geschäft abschließen werden</span></li></ul>

<p><b style="font-family: Arial; font-size: 10pt;">Ermitteln Sie den Projekt-Implementierungsplan des Kunden.</b></p><p><br></p><ul><li><span style="font-family: Arial; font-size: 10pt;">Erforderliche Vereinbarungen einholen</span></li><li><span style="font-family: Arial; font-size: 10pt;">Halten Sie Ihre eigenen internen Rabattverfahren ein</span></li><li><span style="font-family: Arial; font-size: 10pt;">Erhalten Sie einen unterzeichneten Vertrag</span></li></ul>

<p><b style="font-family: Arial; font-size: 10pt;">Ermitteln Sie, welche Leads qualifiziert und welche unqualifiziert sind.</b></p><ul><li><span style="font-size: 10pt;">Weisen Sie den Lead einem Vertreter zu</span></li><li><span style="font-size: 10pt;">Sammeln Sie Kerninformationen zum Lead von der Internetseite der Firma</span></li><li><span style="font-size: 10pt;">Erstellen Sie einen Plan, um eine Beziehung zu diesem Lead herzustellen</span></li></ul>

<p><b style="font-family: Arial; font-size: 10pt;">Dokumentieren Sie Ihre verpassten Verkaufschancen, um zukünftige Gewinne zu steigern.</b></p><p><br></p><ul><li><span style="font-family: Arial; font-size: 10pt;">Identifizieren und protokollieren Sie gelernte Lektionen</span></li><li><span style="font-family: Arial; font-size: 10pt;">Planen Sie bei Bedarf Folgemaßnahmen</span></li></ul>

<p><b style="font-family: Arial; font-size: 10pt;">Gute Arbeit! Sie haben ein erfolgreiches Geschäft abgeschlossen.</b></p>

<p><b style="font-family: Arial; font-size: 10pt;">Hurra! Sie haben ein neues Geschäft, das Sie über die Ziellinie bringen können.</b></p>

<p><b style="font-family: Arial; font-size: 10pt;">Ermitteln Sie die für diese Gelegenheit erforderlichen Produkte oder Dienstleistungen.</b></p><p><br></p><ul><li><span style="font-family: Arial; font-size: 10pt;">Sammeln Sie Kundenberichte, Referenzen oder Wettbewerbsanalysen.</span></li><li><span style="font-family: Arial; font-size: 10pt;">Bestätigen Sie Ihre wichtigsten Stakeholder</span></li><li><span style="font-family: Arial; font-size: 10pt;">Bestimmen Sie, welche Ressourcen Sie für sie zur Verfügung haben</span></li></ul>

<p><b style="font-family: Arial; font-size: 10pt;">Behalten Sie die Übersicht über Ihre unqualifizierten Leads.</b></p><p><span style="font-family: Arial; font-size: 10pt;">Ihr Lead könnte unqualifiziert sein, wenn er nicht an Ihren Produkten interessiert ist oder die zugehörige Firma verlassen hat.</span></p><ul><li><span style="font-size: 10pt;">Dokumentieren Sie Ihre Erfahrungen für zukünftige Bezugnahme</span></li><li><span style="font-size: 10pt;">Speichern Sie die Einzelheiten zum Vorgang und Kontaktinformationen</span></li></ul>

<p><b style="font-family: Arial; font-size: 10pt;">Pflegen Sie Ihre Leads und identifizieren Sie Möglichkeiten.</b></p><ul><li><span style="font-size: 10pt;">Identifizieren Sie Schmerzpunkte, die Sie für diesen Lead lösen können.</span></li><li><span style="font-size: 10pt;">Bestimmen Sie die Wahrscheinlichkeit, dass dieser Lead konvertiert werden kann.</span></li><li><span style="font-size: 10pt;">Wenn dieser Lead qualifiziert ist, wandeln Sie ihn in eine Opportunity um.</span></li><li><span style="font-size: 10pt;">Stellen Sie sicher, dass Marketing und Vertrieb bei der Entwicklung Ihres Lead-Qualifizierungsprozesses zusammenarbeiten.</span></li></ul>

<p><b style="font-family: Arial; font-size: 10pt;">Qualifizieren Sie vielversprechende Leads</b></p><ul><li><span style="font-size: 10pt;">Identifizieren Sie einen Kontakt für den Lead</span></li><li><span style="font-size: 10pt;">Speichern Sie die Kontaktinformationen im Lead- Datensatz</span></li><li><span style="font-size: 10pt;">Erstellen Sie einen Plan für Ihre Kontaktaufnahme (z. B. Wie oft werden Sie sich melden? Was ist Ihr Ansatz?)</span></li></ul>

<p><b style="font-family: Arial; font-size: 10pt;">Qualifizieren Sie Ihre Verkaufschance.</b></p><p><br></p><ul><li><span style="font-family: Arial; font-size: 10pt;">Identifizieren Sie den Geschäftsbedarf, den Sie für den Kunden lösen werden.</span></li><li><span style="font-family: Arial; font-size: 10pt;">Bestätigen Sie, dass der Kunde über ein Budget und eine Genehmigung verfügt.</span></li><li><span style="font-family: Arial; font-size: 10pt;">Bestimmen Sie den Zeitplan auf der Grundlage der Bedürfnisse des Kunden</span></li></ul>

7. Enable Source Tracking from within Dev Hub



## Notes

1. Utility bar items are not translated as per logged in user's language
2. Field History tracking is enabled to varioys fields for the following objects [adjust according to customer needs]
    - Account
    - Contact
    - Lead
    - Opportunity
    - Opportunity Team Member
    - Quote
    - QuoteLineItem
    - Task