---
external: false
draft: false
title: "Intrduzione a Spring Framework"
description: "You can author content using the familiar markdown syntax you already know. All basic markdown syntax is supported."
date: 2022-11-02
---

## Disaccoppiamento, Dependency Injection e Inversion of Control

> "C'è stato un cambio nei riquisiti di business e dovremmo apportare questa piccola modifica"

Quante volte ti è capitato di sentire una frase simile?

Se non ti sei allarmato e hai apportato le modifiche con estrema facilità, allora sei sulla buona strada.

Se nel caso contrario, non è stato così allora potrebbe essere un campanello d'allarme, quanto tempo ci hai impiegato per apportare quella semplice modifica?

La qualità del software è influenzata da diversi fattori, uno di questi è la facilità con la quale è possibile apportare delle modifiche al sistema.
Come sappiamo nello sviluppo software il cambiamento è inevitabile. Tutto cambia, i requisiti di business cambiano, la tecnlogia evolve e le persone cha lavorano su un progetto cambiano nel tempo.

Uno degli obiettivi di uno svilupparore dovrebbe essere quindi quello di scrive del software che risponda bene al cambiamento, che è un aspetto cruciale quando si parla di qualità.

Per scrivere software che risponda bene al cambiamento dobbiamo scrivere software flessibile e manutenibile.
Se scriviamo codice flessibile e facile da mantenere, quando i requisiti di business cambieranno, sarà più semplice apportare le modifiche richieste.

**Tutto molto bello, ma come faccio a scrivere codice più flessibile e manutenibile ?**

### Accoppiamento

Una delle caratteristiche da tenere in considerazione nella programmazione OO è l'**accoppiamento**.
Più alto sarà il grado di dipendenza tra le classi, più alto sarà l'accoppiamento (tight coupling). L'obiettivo dovrebbe essere quello di scrivere delle classi che non dipendano fortemente l'una dalle altre, cercando così di ridurre l'accoppiamento tra le classi (loose coupling).

Vediamo ora un esempio di forte dipendenza tra due classi.

```java
class MySqlCustomerRepository {
    public int[] ages() {
        return new int[] { 21, 34, 54, 18 };
    }
}

class CustomersCalculatorService {

    MySqlCustomerRepository repository;

    public CustomersCalculatorService() {
        this.repository = new MySqlCustomerRepository();
    }

    public int findOldest() {
        return Arrays.stream(repository.ages()).max().orElse(0);
    }
}
```

In questo esempio la classe *CustomersCalculatorService* dipende fortemente dalla classe *MySqlCustomerRepository*.

La classe *MySqlCustomerRepository* viene istanziata direttamente nel costruttore di *CustomersCalculatorService* e questo crea un forte accoppiamento tra le due classi.

Se istanziassimo la classe *MySqlCustomerRepository* in ogni punto del software nel quale vogliamo utilizzarla, nel caso in cui avessimo bisogno per esempio di istanziare in un modo differente la classe, oppure se volessimo sostituire il db MySql con un altro database(per esempio un db Postgres), dovremmo andare a modificare diversi punti nella nostra codebase.

Una solizione per ridurre questo accoppiamento sarebbe quella di utilizzare la Dependency Injection.

### Dependency Injection

La **Dependency Injection** è una tecnica che ci permette di disaccoppiare la creazione di un oggetto dal suo effettivo utilizzo.
Per raggiungere questo obiettivo, l'inizializzazione dei collaboratori viene fatta all'esterno e si dice che vengono *iniettati* nei client che hanno bisgno di utilizzarli.

Vediamo come possiamo applicare la dependency injection alla classe CustomersCalculatorService:

```java
class CustomersCalculatorService {

    MySqlCustomerRepository repository;

    public CustomersCalculatorService(MySqlCustomerRepository repository) {
        this.repository = repository;
    }

    public int findOldest() {
        return Arrays.stream(repository.ages()).max().orElse(0);
    }
}
```

Quello che abbiamo fatto è stato *iniettare* nel costruttore della classe CustomersCalculatorService la sua dipendenza MySqlCustomerRepository.

Questa tecnica, è inotlre in linea e viene spesso utilizzata con il principio SOLID di inversione delle dipendenze (Dependency Inversion Principle).

> a. High-level modules should not depend on low-level modules. Both should depend on abstractions.
> 
> b. Abstractions should not depend on details. Details should depend on abstractions.
> 
>-- Robert C. Martin (Uncle Bob)

In sostanza le nostre classi dovrebbero dipendere da delle astrazioni e non dalle classi concrete.

Vediamo come possiamo ridurre l'accoppiamento utilizzando un astrazione della classe MySqlCustomerRepository e quindi introduciam un interfeccia:

```java
interface CustomerRepository {
    int[] ages();
}

class MySqlCustomerRepository implements CustomerRepository {
    public int[] ages() {
        return new int[]{21, 34, 54, 18};
    }
}

class CustomersCalculatorService {

    CustomerRepository repository;

    public CustomersCalculatorService(CustomerRepository repository) {
        this.repository = repository;
    }

    public int findOldest() {
        return Arrays.stream(repository.ages()).max().orElse(0);
    }
}
```

Quello che abbiamo fatto è stato introdurre l'interfaccia CustomerRepository, che viene implementata da MySqlCustomerRepository ed invece di iniettare la classe concreta nel costruttore
di CustomersCalculatorService andiamo ad iniettare la sua interfaccia.

Adesso la classe CustomersCalculatorService non dipenderà più dalla classe MySqlCustomerRepository, ma bensì dalla sua interfaccia.

Che vantaggi ci da utilizzare questo approcio ?

Se dovessimo per esempio sostituire il database MySql, con un altro database, per esempio un database DynamoDB.
Quello che dovremo fare sarà semplicemente andare ad introdurre una nuova classe, ed iniettare questo nuova calsse al posto della classe MySqlCustomerRepository.

Vediamolo nel concreto:

```java
interface CustomerRepository {
    int[] ages();
}

class MySqlCustomerRepository implements CustomerRepository {
    public int[] ages() {
        return new int[]{21, 34, 54, 18};
    }
}

class DynamoDbCustomerRepository implements CustomerRepository {
    public int[] ages() {
        return new int[]{101, 304, 504, 188};
    }
}

class CustomersCalculatorService {

    CustomerRepository repository;

    public CustomersCalculatorService(CustomerRepository repository) {
        this.repository = repository;
    }

    public int findOldest() {
        return Arrays.stream(repository.ages()).max().orElse(0);
    }
}
```

Abbiamo creato le nuova classe DynamoDbCustomerRepository che implementa l'interfaccia CustomerRepository in modo da poterla iniettare in CustomersCalculatorService.
Come avrai notato non è stato necessatio apportare alcuna modifica alla classe CustomersCalculatorService, l'unica modifica necessaria sarà demandata all'esterno al componente che si occupa della configurazione delle dipendenze e dell'inizializzazione delle diverse classi.

Usando questo approcio non solo rispettiamo il Dependency Inversion Principle, ma anche l'OCP (Open Closed Principle).
L'Open Closed Principle afferma che il software dvorebbe essere aperto alle estensioni, ma chiuso al cambiamento. In sostanza un software dovrebbe essere estendibile per l'aggiunta di nuove funzionalità, senza richiedere modfiche dirette al codice esistente.

Nel nostro caso stiamo rispettando questo principio perchè per sostituire il tipo di database non abbiamo modificato direttamente la classe CustomersCalculatorService, ma abbiamo esteso il nostro sistema aggiungendo una nuova classe DynamoDbCustomerRepository che implementa l'interfaccia CustomerRepository.

Se volessimo aggiungere un nuovo tipo di database ci basterebbe creare una nuova classe che implementa l'interfaccia CustomerRepository e iniettarla nel costruttore di CustomersCalculatorService.

Come iniettiamo le dipendenze:
```java
public class SpringFrameworkFundamentalsApplication {

    public static void main(String[] args) {

        //var repository = new MySqlCustomerRepository();
        var repository = new DynamoDbCustomerRepository();
        var calculator = new CustomersCalculatorService(repository);

        var oldest = calculator.findOldest();

        System.out.println("Oldest: " + oldest);
    }
}
```

La classe sopra rappresenta l'entry point della nostra applicazione.
Come potrai intuire utilizzando questo approcio l'applicazione diventa più flessibile e modulare, ma implica un piccolo tradeoff, bensì in questo modo stiamo riducendo la dipendenza stretta tra le classi e bensì stiamo andando ad aumentare molto la flessibilità, manutenibiltà e testabilità della nostra applicazione, stiamo aggiungendo un livello di complessità.

Nell'esempio fornito sopra con la classe *SpringFrameworkFundamentalsApplication* stiamo semplicemente andando ad inizializzare uno dei due repository, inizializziamo il nostro CustomersCalculatorService e gli iniettiamo la dipendenza corretta.
Può sembrare semplice, ma in applicazioni reali e più complesse, le classi da configurare sono diverse e bisogna stare attenti ed iniettare sempre la dipendeze corrette nel punto giusto.

In questo ci sono diversi framework che ci possono aiutare e uno di questo è **Spring**.