import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Analytics from "./pages/Analytics";
import CalendarPage from "./pages/CalendarPage";
import Goals from "./pages/Goals";
import Achievements from "./pages/Achievements";
import Profile from "./pages/Profile";
import FocusPage from "./pages/FocusPage";
import JournalPage from "./pages/JournalPage";
import SettingsPage from "./pages/SettingsPage";

function Router() {
  return <Switch>
    <Route path="/" component={Home} />
    <Route path="/goals" component={Goals} />
    <Route path="/calendar" component={CalendarPage} />
    <Route path="/analytics" component={Analytics} />
    <Route path="/achievements" component={Achievements} />
    <Route path="/profile" component={Profile} />
    <Route path="/leetcode" component={() => <FocusPage section="leetcode" />} />
    <Route path="/web-dev" component={() => <FocusPage section="web" />} />
    <Route path="/gym" component={() => <FocusPage section="gym" />} />
    <Route path="/journal" component={JournalPage} />
    <Route path="/settings" component={SettingsPage} />
    <Route path="/404" component={NotFound} />
    <Route component={NotFound} />
  </Switch>;
}

export default function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="dark" switchable><TooltipProvider><Toaster /><Router /></TooltipProvider></ThemeProvider></ErrorBoundary>;
}
