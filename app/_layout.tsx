"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  AppShell,
  SideBar,
  SidebarTitle,
  SidebarItem,
  Header,
  HeaderProfile,
  Dropdown,
  DropdownItem,
  DropdownTitle,
  Button,
  Breadcrumb,
} from "design-system-zeroz";

import ModalLogin from "@/components/modalLogin/modalLogin";
import ModalCriarConta from "@/components/modalCriarConta/modalCriarConta";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();
  const [toggleSidebar, setToggleSidebar] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isCreateAccountOpen, setIsCreateAccountOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const pathname = usePathname();

  // Monitora login/logout do Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleToggleSidebar = () => setToggleSidebar(!toggleSidebar);

  const breadcrumb = useMemo(() => {
    if (pathname === "/") {
      return <Breadcrumb items={[{ pageName: "Página Inicial", href: "/" }]} />;
    }
    const segments = pathname.split("/").filter(Boolean);
    const items = segments.map((segment, index) => ({
      pageName: segment.charAt(0).toUpperCase() + segment.slice(1),
      href: "/" + segments.slice(0, index + 1).join("/"),
    }));
    items.unshift({ pageName: "Página Inicial", href: "/" });
    return <Breadcrumb items={items} />;
  }, [pathname]);

  if (pathname === "/auth/login" || pathname === "/auth/criar-conta") {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    await signOut(auth);
    console.log("Deslogado com sucesso");
    router.push("/"); // opcional
  };

  return (
    <>
      <AppShell>
        <Header onClick={handleToggleSidebar} breadcrumb={breadcrumb}>
          {user ? (
            <HeaderProfile name={user.displayName || user.email || "Usuário"}>
              <Dropdown
                dropdown
                children={
                  <>
                    <DropdownTitle content="Tema" />
                    <DropdownItem typeIcon="sunny" content="Light" />
                    <DropdownTitle content="Configurações" />
                    <DropdownItem typeIcon="account_circle" content="Perfil" />
                    <DropdownItem typeIcon="logout" content="Sair" onClick={handleLogout} />
                  </>
                }
              />
            </HeaderProfile>
          ) : (
            <div style={{ display: "flex", gap: "var(--s-spacing-xx-small)" }}>
              <Button
                size="md"
                variant="secondary"
                onClick={() => setIsLoginOpen(true)}
              >
                Login
              </Button>
              <Button
                size="md"
                variant="primary"
                onClick={() => setIsCreateAccountOpen(true)}
              >
                Criar Conta
              </Button>
            </div>
          )}
        </Header>

        <SideBar
          toggle={toggleSidebar}
          brand="/logo.png"
          brandSize="lg"
          setToggleSidebar={handleToggleSidebar}
        >
          <SidebarTitle title="Menu" />
          <SidebarItem
            title="Página Inicial"
            icon="home"
            fillIcon
            onClick={() => router.push("/")}
            isActive={pathname === "/"}
          />
          <SidebarTitle title="Mapa" />
          <SidebarItem
            title="Solicitações"
            icon="list"
            fillIcon
            onClick={() => router.push("/solicitacoes")}
            isActive={pathname === "/solicitacoes"}
          />
        </SideBar>

        {children}
      </AppShell>

      <ModalLogin
        hideModal={() => setIsLoginOpen(false)}
        isOpen={isLoginOpen}
      />

      <ModalCriarConta
        hideModal={() => setIsCreateAccountOpen(false)}
        isOpen={isCreateAccountOpen}
      />
    </>
  );
}
