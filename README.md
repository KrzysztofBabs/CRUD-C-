# TodoList API

Projekt backendowy napisany w C# (.NET 10) realizujący klasycznego CRUD-a do zarządzania zadaniami. Aplikacja powstała w celu praktycznego wykorzystania nowoczesnego, lekkiego podejścia do budowania API w ekosystemie .NET.

## Technologie
- **C# / .NET 10**
- **Entity Framework Core** (ORM)
- **PostgreSQL**

## Architektura i rozwiązania w kodzie

W projekcie zrezygnowano z klasycznego, ciężkiego podejścia opartego na rozbudowanej strukturze katalogów i dziesiątkach plików (znanego m.in. ze starszych wersji ASP.NET MVC) na rzecz lżejszych i nowocześniejszych mechanizmów wbudowanych w nowe wersje C#.

### 1. Minimal API (Brak kontrolerów)
Zamiast tworzyć osobne klasy Controllerów z masą atrybutów, cała logika routingu i obsługi zapytań HTTP została zdefiniowana w jednym pliku `Program.cs`. Aplikacja mapuje konkretne akcje bezpośrednio pod ścieżki URL (np. `app.MapGet`, `app.MapPost`), co mocno redukuje ilość tzw. boilerplate code i przyspiesza działanie aplikacji.

### 2. Pełna asynchroniczność (async/await)
Każda operacja wejścia/wyjścia, w tym komunikacja z bazą danych (np. `ToListAsync()`, `FindAsync()`), jest w pełni asynchroniczna. Użycie `await` sprawia, że wątki serwera nie są blokowane w oczekiwaniu na odpowiedź z bazy, co drastycznie zwiększa przepustowość aplikacji przy wielu jednoczesnych zapytaniach z frontendu.

### 3. Entity Framework Core zamiast czystego SQL
Aplikacja nie zawiera ani jednej linijki czystego kodu SQL. Zamiast tego komunikuje się z bazą PostgreSQL przy użyciu EF Core:
- **Mapowanie w locie:** Zamiast ręcznego przypisywania wyników z bazy do pól obiektów, EF Core sam tłumaczy wiersze z tabel na listy obiektów C# (`List<TodoItem>`).
- **Code-First:** Schemat bazy i tabele są generowane i weryfikowane automatycznie na podstawie definicji klas w kodzie podczas startu aplikacji (za pomocą `EnsureCreated()`).
- Ochrona przed SQL Injection jest obsługiwana domyślnie pod maską przez framework.

### 4. Wstrzykiwanie zależności (DI) w parametrach
Zrezygnowano z definiowania pól prywatnych i pisania konstruktorów do wstrzykiwania zależności. Kontekst bazy danych (`TodoContext db`) jest wstrzykiwany bezpośrednio jako argument w funkcjach obsługujących poszczególne endpointy. Kontener DI (Dependency Injection) frameworka automatycznie rozwiązuje te zależności w momencie nadejścia żądania HTTP.

### 5. Automatyczny Model Binding
Przy endpointach przyjmujących dane (POST, PUT), framework automatycznie parsuje ciało zapytania (JSON) i mapuje je na silnie typowane obiekty języka C# (`TodoItem`). Wyciąganie parametrów ze ścieżki URL (np. `id` z `/todos/{id}`) odbywa się w locie i jest automatycznie rzutowane na odpowiednie typy proste.

## Dostępne Endpointy

- `GET /todos` - Zwraca kompletną listę zadań.
- `POST /todos` - Tworzy nowe zadanie.
- `PUT /todos/{id}` - Aktualizuje stan (np. nazwę lub flagę IsComplete) dla zadania o podanym identyfikatorze. Zwraca status `204 No Content` przy sukcesie lub `404 Not Found`.
- `DELETE /todos/{id}` - Usuwa zadanie z bazy danych.
