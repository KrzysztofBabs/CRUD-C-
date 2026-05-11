# 🚀 TodoList API - Nowoczesny Backend w C#

Ten projekt to w pełni funkcjonalne API typu CRUD (Create, Read, Update, Delete) zbudowane w języku C# (.NET 10).

Celem aplikacji jest zarządzanie zadaniami (To-Do List), a sam kod został zaprojektowany z naciskiem na wydajność, minimalizm i wykorzystanie najnowszych mechanizmów języka C#. Do projektu podpięty jest również frontendowy Dashboard.

## 🧠 Architektura i zalety kodu

W aplikacji zrezygnowano ze starego, ciężkiego podejścia (znanego m.in. z klasycznego Spring Boota czy starych wersji ASP.NET) na rzecz nowoczesnych, lekkich wzorców:

* **Minimal APIs:** Zamiast tworzyć osobne, rozbudowane klasy kontrolerów, cała logika routingu i obsługi żądań HTTP została zamknięta w jednym, czytelnym pliku `Program.cs`. Przypomina to zwinność frameworków z ekosystemu Node.js.
* **W 100% Asynchroniczne I/O (`async/await`):** Każde odwołanie do bazy danych (np. `ToListAsync()`, `FindAsync()`) nie blokuje głównego wątku serwera. Dzięki temu aplikacja jest w stanie obsłużyć tysiące zapytań jednocześnie bez "zamrażania" aplikacji.
* **Wstrzykiwanie Zależności (DI) "w locie":** Baza danych jest wstrzykiwana bezpośrednio do argumentów funkcji obsługujących endpointy (np. `(TodoContext db)`), co całkowicie eliminuje potrzebę pisania konstruktorów i ręcznego zarządzania instancjami.
* **Brak Boilerplate Code:** Model danych wykorzystuje Właściwości w C# (`{ get; set; }`), co eliminuje konieczność generowania dziesiątek linijek z getterami i setterami (jak ma to miejsce w klasycznej Javie bez Lomboka).
* **Automatyczny Model Binding:** Framework sam wyciąga dane z ciała żądania (JSON) i bezpiecznie parsuje je na silnie typowane obiekty języka C#.

## 🗄️ Warstwa danych (Entity Framework Core)

Aplikacja nie używa czystego kodu SQL. Zamiast tego wykorzystuje **Entity Framework Core (ORM)** do komunikacji z relacyjną bazą danych PostgreSQL.

* **Zero SQL Injection:** Zapytania są generowane bezpiecznie pod maską przez framework.
* **Przenośność:** Przejście z deweloperskiej bazy w pamięci RAM (In-Memory) na produkcyjnego PostgreSQL-a wymagało zmiany zaledwie jednej linijki kodu w konfiguracji (`appsettings.json`).
* **Code-First:** Tabele w bazie danych są automatycznie generowane na podstawie modeli klas w C# podczas startu aplikacji (`EnsureCreated()`).

## 🐳 Konteneryzacja (Docker)

Zarówno baza danych PostgreSQL, jak i sama aplikacja .NET mogą działać w odizolowanych środowiskach za pomocą Dockera.
Projekt wykorzystuje tzw. **Multi-stage build** w pliku `Dockerfile` – do budowania kodu wykorzystywany jest ciężki obraz SDK, natomiast do uruchomienia aplikacji wędruje wyłącznie lekki obraz ASP.NET Runtime, co drastycznie zmniejsza wagę końcowej aplikacji.

## 📡 Lista Endpointów (REST API)

| Metoda | Endpoint | Akcja | Zwracany status |
| :--- | :--- | :--- | :--- |
| **GET** | `/todos` | Pobiera wszystkie zadania | `200 OK` |
| **POST** | `/todos` | Dodaje nowe zadanie | `201 Created` |
| **PUT** | `/todos/{id}` | Aktualizuje pola wybranego zadania | `204 No Content` / `404 Not Found` |
| **DELETE** | `/todos/{id}` | Usuwa zadanie z bazy | `204 No Content` / `404 Not Found` |

