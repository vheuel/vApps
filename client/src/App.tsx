import { Switch, Route } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import RegisterPage from "@/pages/register-page";
import ProfilePage from "@/pages/profile-page";
import EditProfilePage from "@/pages/edit-profile-page";
import SubmitProjectPage from "@/pages/submit-project-page";
import CategoryPage from "@/pages/category-page";
import AdminPage from "@/pages/admin-page";
import DocumentationPage from "@/pages/documentation-page";
import TermsPage from "@/pages/terms-page";
import PrivacyPolicyPage from "@/pages/privacy-policy-page";
import CookiePolicyPage from "@/pages/cookie-policy-page";
import PostsPage from "@/pages/posts-page";
import PostDetailPage from "@/pages/post-detail-page";
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
            <Route path="/login" component={AuthPage} />
            <Route path="/register" component={RegisterPage} />
            <Route path="/auth" component={AuthPage} /> {/* Untuk backward compatibility */}
            <Route path="/category/:category" component={CategoryPage} />
            <Route path="/docs" component={DocumentationPage} />
            <Route path="/terms" component={TermsPage} />
            <Route path="/privacy" component={PrivacyPolicyPage} />
            <Route path="/cookies" component={CookiePolicyPage} />
            <ProtectedRoute path="/profile" component={ProfilePage} />
            <ProtectedRoute path="/profile/edit" component={EditProfilePage} />
            <ProtectedRoute path="/submit" component={SubmitProjectPage} />
            <AdminRoute path="/admin" component={AdminPage} />
            <Route path="/posts" component={PostsPage} />
            <Route path="/posts/:id" component={PostDetailPage} />
            <Route path="/journals" component={PostsPage} />
            <Route path="/journals/:id" component={PostDetailPage} />
            <Route component={NotFound} />
          </Switch>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;