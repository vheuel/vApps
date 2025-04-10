import { LegalPageWrapper } from "@/components/layout/legal-page-wrapper";

export default function CookiePolicyPage() {
  return (
    <LegalPageWrapper title="Cookie Policy">
      <div className="rounded-md border p-6 bg-card space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-3">1. What Are Cookies</h2>
          <p className="text-muted-foreground leading-relaxed">
            As is common practice with almost all professional websites, vApps uses cookies, which are tiny 
            files that are downloaded to your computer, to improve your experience. This page describes what 
            information they gather, how we use it, and why we sometimes need to store these cookies. We will 
            also share how you can prevent these cookies from being stored, however, this may downgrade or 
            'break' certain elements of the site's functionality.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">2. How We Use Cookies</h2>
          <p className="text-muted-foreground leading-relaxed">
            We use cookies for a variety of reasons detailed below. Unfortunately, in most cases, there are 
            no industry standard options for disabling cookies without completely disabling the functionality 
            and features they add to this site. It is recommended that you leave on all cookies if you are 
            not sure whether you need them or not in case they are used to provide a service that you use.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">3. Types of Cookies We Use</h2>
          
          <div className="mt-4">
            <h3 className="text-xl font-medium mb-2">3.1 Essential Cookies</h3>
            <p className="text-muted-foreground leading-relaxed">
              These cookies are necessary for the website to function and cannot be switched off in our systems. 
              They are usually only set in response to actions made by you which amount to a request for services, 
              such as setting your privacy preferences, logging in, or filling in forms. You can set your browser 
              to block or alert you about these cookies, but some parts of the site will not then work.
            </p>
          </div>

          <div className="mt-4">
            <h3 className="text-xl font-medium mb-2">3.2 Performance Cookies</h3>
            <p className="text-muted-foreground leading-relaxed">
              These cookies allow us to count visits and traffic sources so we can measure and improve the 
              performance of our site. They help us to know which pages are the most and least popular and 
              see how visitors move around the site. All information these cookies collect is aggregated and 
              therefore anonymous.
            </p>
          </div>

          <div className="mt-4">
            <h3 className="text-xl font-medium mb-2">3.3 Functionality Cookies</h3>
            <p className="text-muted-foreground leading-relaxed">
              These cookies enable the website to provide enhanced functionality and personalization. They may 
              be set by us or by third-party providers whose services we have added to our pages. If you do not 
              allow these cookies, then some or all of these services may not function properly.
            </p>
          </div>

          <div className="mt-4">
            <h3 className="text-xl font-medium mb-2">3.4 Targeting Cookies</h3>
            <p className="text-muted-foreground leading-relaxed">
              These cookies may be set through our site by our advertising partners. They may be used by those 
              companies to build a profile of your interests and show you relevant advertisements on other sites. 
              They do not store directly personal information but are based on uniquely identifying your browser 
              and internet device.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">4. Disabling Cookies</h2>
          <p className="text-muted-foreground leading-relaxed">
            You can prevent the setting of cookies by adjusting the settings on your browser (see your browser's 
            "Help" section for how to do this). Be aware that disabling cookies will affect the functionality of 
            this and many other websites that you visit. Disabling cookies will usually result in also disabling 
            certain functionality and features of this site. Therefore it is recommended that you do not disable cookies.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">5. Third-Party Cookies</h2>
          <p className="text-muted-foreground leading-relaxed">
            In some special cases, we also use cookies provided by trusted third parties. The following section 
            details which third-party cookies you might encounter through this site.
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-2">
            <li>
              This site uses Google Analytics which is one of the most widespread and trusted analytics solutions 
              on the web for helping us to understand how you use the site and ways that we can improve your experience. 
              These cookies may track things such as how long you spend on the site and the pages that you visit so 
              we can continue to produce engaging content.
            </li>
            <li>
              We also use social media buttons and/or plugins on this site that allow you to connect with your 
              social network in various ways. For these to work, social media sites will set cookies through our 
              site which may be used to enhance your profile on their site or contribute to the data they hold 
              for various purposes outlined in their respective privacy policies.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">6. Cookie Preferences</h2>
          <p className="text-muted-foreground leading-relaxed">
            When you first visit our website, we will present you with a cookie consent banner that allows you 
            to accept or decline non-essential cookies. You can change your cookie preferences at any time by 
            clicking on the 'Cookie Settings' link in the footer of our website.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">7. More Information</h2>
          <p className="text-muted-foreground leading-relaxed">
            Hopefully, that has clarified things for you. As was previously mentioned, if there is something 
            that you aren't sure whether you need or not, it's usually safer to leave cookies enabled in case 
            it does interact with one of the features you use on our site.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-2">
            However, if you are still looking for more information, you can contact us through one of our 
            preferred contact methods:
          </p>
          <p className="text-muted-foreground leading-relaxed mt-2">
            Email: privacy@vheuel.com
          </p>
        </section>

        <div className="border-t pt-4 mt-8">
          <p className="text-sm text-muted-foreground text-center">
            Last updated: April 9, 2025
          </p>
        </div>
      </div>
    </LegalPageWrapper>
  );
}