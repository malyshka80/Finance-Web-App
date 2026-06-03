import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  BrainCircuit,
  CalendarCheck,
  ChartPie,
  CircleDollarSign,
  Globe2,
  MessagesSquare,
  Mail,
  Send,
  ShieldCheck,
  Sparkles,
  Target,
  WalletCards,
} from "lucide-react";
import MoneyAtmosphere from "../Components/MoneyAtmosphere";
import "./opening.css";

const features = [
  {
    icon: ChartPie,
    title: "Suivi des depenses",
    text: "Catégories, périodes et alertes de dépassement.",
  },
  {
    icon: BrainCircuit,
    title: "Assistant IA",
    text: "Conseils personnalisés et prévisions mensuelles.",
  },
  {
    icon: Target,
    title: "Objectifs de vie",
    text: "Épargne, projets, rappels et progression.",
  },
];

const stats = [
  { label: "Solde disponible", value: "3500 DT" },
  { label: "Économies", value: "100%" },
  { label: "Tâches", value: "0" },
];

const cards = [
  { icon: WalletCards, title: "Portefeuille", value: "+3500 DT", tone: "mint" },
  { icon: CalendarCheck, title: "Rappels", value: "Factures", tone: "coral" },
  { icon: ShieldCheck, title: "Sécurité", value: "Données privées", tone: "violet" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 28, filter: "blur(8px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)" },
};

export default function Opening() {
  return (
    <div className="opening-page">
      <MoneyAtmosphere variant="landing" density={1.08} />
      <header className="opening-nav">
        <a className="opening-brand" href="/">
          <span className="opening-brand-mark">
            <CircleDollarSign size={20} />
          </span>
          <span>
            FinanceApp
            <small>Gestion intelligente</small>
          </span>
        </a>

        <nav className="opening-links" aria-label="Navigation principale">
          <a href="#about">About</a>
          <a href="/login">Login</a>
          <a className="opening-cta" href="/register">
            Get Started
          </a>
        </nav>
      </header>

      <main>
        <section className="opening-hero">
          <motion.div
            className="opening-copy"
            initial="hidden"
            animate="visible"
            transition={{ staggerChildren: 0.12 }}
          >
            <motion.div className="opening-kicker" variants={fadeUp}>
              <Sparkles size={16} />
              Coach financier web propulsé par IA
            </motion.div>

            <motion.h1 variants={fadeUp}>
              Des décisions financières plus claires, chaque mois.
            </motion.h1>

            <motion.p variants={fadeUp}>
              FinanceApp aide l'utilisateur à suivre ses revenus, comprendre ses
              dépenses, organiser ses objectifs et recevoir des recommandations
              intelligentes dans une interface simple et rassurante.
            </motion.p>

            <motion.div className="opening-actions" variants={fadeUp}>
              <a href="/register" className="opening-primary-btn">
                Start Free
                <ArrowRight size={18} />
              </a>
              <a href="#about" className="opening-secondary-btn">
                Learn More
              </a>
            </motion.div>

            <motion.div className="opening-proof" variants={fadeUp}>
              {stats.map((item) => (
                <div className="opening-proof-item" key={item.label}>
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            className="opening-visual opening-visual-3d"
            initial={{ opacity: 0, scale: 0.94, rotateX: 8 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="opening-visual-grid" aria-hidden="true" />

            <div className="opening-dashboard-card">
              <div className="opening-dashboard-top">
                <div>
                  <span>Budget mensuel</span>
                  <strong>3500 DT</strong>
                </div>
                <BadgeCheck size={28} />
              </div>

              <div className="opening-chart" aria-hidden="true">
                <span style={{ height: "36%" }} />
                <span style={{ height: "62%" }} />
                <span style={{ height: "48%" }} />
                <span style={{ height: "78%" }} />
                <span style={{ height: "58%" }} />
                <span style={{ height: "88%" }} />
              </div>

              <div className="opening-progress">
                <div>
                  <span>Épargne</span>
                  <strong>100%</strong>
                </div>
                <div className="opening-progress-bar">
                  <span />
                </div>
              </div>
            </div>

            {cards.map((card, index) => {
              const Icon = card.icon;
              return (
                <div
                  className={`opening-floating-card ${card.tone}`}
                  key={card.title}
                  style={{ animationDelay: `${index * 0.35}s` }}
                >
                  <Icon size={20} />
                  <span>{card.title}</span>
                  <strong>{card.value}</strong>
                </div>
              );
            })}
          </motion.div>
        </section>

        <section id="about" className="opening-about">
          <motion.div
            className="opening-about-header"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.35 }}
            transition={{ staggerChildren: 0.1 }}
          >
            <motion.span className="opening-section-label" variants={fadeUp}>
              À propos
            </motion.span>
            <motion.h2 variants={fadeUp}>Une plateforme pour mieux piloter sa vie financière.</motion.h2>
            <motion.p variants={fadeUp}>
              Le projet combine budget personnel, organisation de vie, objectifs
              financiers, statistiques et assistance intelligente pour transformer
              les données quotidiennes en actions concrètes.
            </motion.p>
          </motion.div>

          <div className="opening-feature-grid">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.article
                  className="opening-feature"
                  key={feature.title}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.35 }}
                  variants={fadeUp}
                  transition={{ delay: index * 0.08 }}
                >
                  <Icon size={24} />
                  <h3>{feature.title}</h3>
                  <p>{feature.text}</p>
                </motion.article>
              );
            })}
          </div>

          <div className="opening-contact">
            <motion.div
              className="opening-contact-card"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.35 }}
              variants={fadeUp}
            >
              <Mail size={24} />
              <h3>Contact</h3>
              <a href="mailto:support@finai.app">support@finai.app</a>
              <div className="opening-socials">
                <a href="https://instagram.com" aria-label="Instagram">
                  <MessagesSquare size={18} />
                </a>
                <a href="https://facebook.com" aria-label="Facebook">
                  <Globe2 size={18} />
                </a>
              </div>
            </motion.div>

            <motion.form
              className="opening-form"
              onSubmit={(event) => event.preventDefault()}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.35 }}
              variants={fadeUp}
            >
              <input type="text" placeholder="Full Name" aria-label="Full Name" />
              <input type="email" placeholder="Email Address" aria-label="Email Address" />
              <textarea placeholder="Your message..." aria-label="Your message" />
              <button type="submit">
                Send Message
                <Send size={16} />
              </button>
            </motion.form>
          </div>
        </section>
      </main>

      <footer className="opening-footer">
        © {new Date().getFullYear()} FinAI. All rights reserved.
      </footer>
    </div>
  );
}
