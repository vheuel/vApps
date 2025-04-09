import { ScrollArea } from "@/components/ui/scroll-area";

export default function PrivacyPolicyPage() {
  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      
      <ScrollArea className="h-[60vh] rounded-md border p-6 bg-card">
        <div className="space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-3">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              Vheüel ("we", "our", or "us") operates the vApps website (the "Service"). This page informs you 
              of our policies regarding the collection, use, and disclosure of personal data when you use our 
              Service and the choices you have associated with that data.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-2">
              We use your data to provide and improve the Service. By using the Service, you agree to the 
              collection and use of information in accordance with this policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">2. Data Collection and Use</h2>
            <p className="text-muted-foreground leading-relaxed">
              We collect several different types of information for various purposes to provide and improve our Service to you.
            </p>
            
            <div className="mt-4">
              <h3 className="text-xl font-medium mb-2">2.1 Personal Data</h3>
              <p className="text-muted-foreground leading-relaxed">
                While using our Service, we may ask you to provide us with certain personally identifiable 
                information that can be used to contact or identify you ("Personal Data"). Personally 
                identifiable information may include, but is not limited to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-2">
                <li>Email address</li>
                <li>First name and last name</li>
                <li>Username</li>
                <li>Cookies and Usage Data</li>
                <li>Wallet addresses (if voluntarily provided)</li>
              </ul>
            </div>

            <div className="mt-4">
              <h3 className="text-xl font-medium mb-2">2.2 Usage Data</h3>
              <p className="text-muted-foreground leading-relaxed">
                We may also collect information about how the Service is accessed and used ("Usage Data"). 
                This Usage Data may include information such as your computer's Internet Protocol address 
                (e.g. IP address), browser type, browser version, the pages of our Service that you visit, 
                the time and date of your visit, the time spent on those pages, unique device identifiers 
                and other diagnostic data.
              </p>
            </div>

            <div className="mt-4">
              <h3 className="text-xl font-medium mb-2">2.3 Tracking & Cookies Data</h3>
              <p className="text-muted-foreground leading-relaxed">
                We use cookies and similar tracking technologies to track the activity on our Service and 
                hold certain information. You can instruct your browser to refuse all cookies or to indicate 
                when a cookie is being sent. However, if you do not accept cookies, you may not be able to use 
                some portions of our Service.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-2">
                For more information about the cookies we use, please see our Cookie Policy.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">3. Use of Data</h2>
            <p className="text-muted-foreground leading-relaxed">
              Vheüel uses the collected data for various purposes:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-2">
              <li>To provide and maintain the Service</li>
              <li>To notify you about changes to our Service</li>
              <li>To allow you to participate in interactive features of our Service when you choose to do so</li>
              <li>To provide customer care and support</li>
              <li>To provide analysis or valuable information so that we can improve the Service</li>
              <li>To monitor the usage of the Service</li>
              <li>To detect, prevent and address technical issues</li>
              <li>To verify the legitimacy of submitted projects and prevent fraud</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">4. Data Sharing and Disclosure</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may disclose your Personal Data in the good faith belief that such action is necessary to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-2">
              <li>Comply with a legal obligation</li>
              <li>Protect and defend the rights or property of Vheüel</li>
              <li>Prevent or investigate possible wrongdoing in connection with the Service</li>
              <li>Protect the personal safety of users of the Service or the public</li>
              <li>Protect against legal liability</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">5. Data Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              The security of your data is important to us, but remember that no method of transmission over 
              the Internet, or method of electronic storage is 100% secure. While we strive to use commercially 
              acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">6. Your Data Protection Rights</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you are a resident of the European Economic Area (EEA), you have certain data protection rights. 
              Vheüel aims to take reasonable steps to allow you to correct, amend, delete, or limit the use of your Personal Data.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-2">
              In certain circumstances, you have the following data protection rights:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-2">
              <li>The right to access, update or to delete the information we have on you</li>
              <li>The right of rectification - You have the right to have your information rectified if that information is inaccurate or incomplete</li>
              <li>The right to object - You have the right to object to our processing of your Personal Data</li>
              <li>The right of restriction - You have the right to request that we restrict the processing of your personal information</li>
              <li>The right to data portability - You have the right to be provided with a copy of the information we have on you in a structured, machine-readable and commonly used format</li>
              <li>The right to withdraw consent - You also have the right to withdraw your consent at any time where Vheüel relied on your consent to process your personal information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">7. Children's Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our Service does not address anyone under the age of 18 ("Children"). We do not knowingly collect 
              personally identifiable information from anyone under the age of 18. If you are a parent or guardian 
              and you are aware that your Child has provided us with Personal Data, please contact us. If we become 
              aware that we have collected Personal Data from children without verification of parental consent, 
              we take steps to remove that information from our servers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">8. Changes to This Privacy Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting 
              the new Privacy Policy on this page and updating the "Last updated" date at the bottom of this page.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-2">
              You are advised to review this Privacy Policy periodically for any changes. Changes to this 
              Privacy Policy are effective when they are posted on this page.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">9. Blockchain Data</h2>
            <p className="text-muted-foreground leading-relaxed">
              vApps is a platform focused on Web3 and blockchain projects. When you submit blockchain-related 
              information (such as wallet addresses, transactions, or project details), this information may be 
              displayed publicly on the platform. Please be aware that blockchain transactions are inherently 
              public and immutable. Always exercise caution when connecting wallets or sharing blockchain identifiers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">10. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us:
            </p>
            <p className="text-muted-foreground leading-relaxed mt-2">
              By email: privacy@vheuel.com
            </p>
          </section>

          <div className="border-t pt-4 mt-8">
            <p className="text-sm text-muted-foreground text-center">
              Last updated: April 9, 2025
            </p>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}