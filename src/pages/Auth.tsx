import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Login from "@/components/auth/Login";
import ParentRegister from "@/components/auth/ParentRegister";
import ChildRegister from "@/components/auth/ChildRegister";
import { Sparkles, Heart } from "lucide-react";

const Auth = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[hsl(var(--calm-lavender)_/_0.2)] via-[hsl(var(--gentle-cream))] to-[hsl(var(--soft-mint)_/_0.2)]">
      <div className="w-full max-w-5xl">
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Heart className="w-12 h-12 text-primary animate-gentle-bounce" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Griffit
            </h1>
            <Sparkles className="w-12 h-12 text-secondary animate-gentle-bounce" style={{ animationDelay: "0.2s" }} />
          </div>
          <p className="text-xl text-muted-foreground font-medium">
            Empowering Communication Through Understanding
          </p>
        </div>

        <Card className="glass-effect shadow-[var(--shadow-float)] border-2">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-3 p-2 bg-muted/50">
              <TabsTrigger value="login" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Login
              </TabsTrigger>
              <TabsTrigger value="parent" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Parent Sign Up
              </TabsTrigger>
              <TabsTrigger value="child" className="rounded-lg data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
                Child Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="p-6">
              <Login />
            </TabsContent>

            <TabsContent value="parent" className="p-6">
              <ParentRegister />
            </TabsContent>

            <TabsContent value="child" className="p-6">
              <ChildRegister />
            </TabsContent>
          </Tabs>
        </Card>

        <p className="text-center mt-6 text-sm text-muted-foreground">
          A safe space for connection and growth 🌱
        </p>
      </div>
    </div>
  );
};

export default Auth;
