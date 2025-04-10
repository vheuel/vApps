import { Switch, Route } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import ProfilePage from "@/pages/profile-page";
import EditProfilePage from "@/pages/edit-profile-page";
import SubmitProjectPage from "@/pages/submit-project-page";
import CategoryPage from "@/pages/category-page";
import AdminPage from "@/pages/admin-page";
import DocumentationPage from "@/pages/documentation-page";
import TermsPage from "@/pages/terms-page";
import PrivacyPolicyPage from "@/pages/privacy-policy-page";
import CookiePolicyPage from "@/pages/cookie-policy-page";
import JournalsPage from "@/pages/journals-page";
import JournalDetailPage from "@/pages/journal-detail-page";
import NotFound from "@/pages/not-found";
import { ProtectedRoute } from "./lib/protected-route";
import { AdminRoute } from "./lib/protected-route";
import { AuthProvider } from "./hooks/use-auth";

function App() {
  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <Switch>
            <Route path="/" component={HomePage} />
            <Route path="/auth" component={AuthPage} />
            <Route path="/category/:category" component={CategoryPage} />
            <Route path="/docs" component={DocumentationPage} />
            <Route path="/terms" component={TermsPage} />
            <Route path="/privacy" component={PrivacyPolicyPage} />
            <Route path="/cookies" component={CookiePolicyPage} />
            <ProtectedRoute path="/profile" component={ProfilePage} />
            <ProtectedRoute path="/profile/edit" component={EditProfilePage} />
            <ProtectedRoute path="/submit" component={SubmitProjectPage} />
            <AdminRoute path="/admin" component={AdminPage} />
            <Route path="/journals" component={JournalsPage} />
            <Route path="/journal/:id" component={JournalDetailPage} />
            <Route component={NotFound} />
          </Switch>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;