---
external: false
draft: false
title: "Ridurre l'accoppiamento e migliorare la qualità del codice con la Dependency Injection"
description: "Introduzione ai concetti principali di Spring Framework come Dependency Injection e Depenency Inversion Principle."
date: 2022-11-02
---

## Introduzione

> "C'è stato un cambio nei requisiti di business e dovremmo apportare questa piccola modifica"

 *Quante volte ti è capitato di sentire una frase simile? Quanto tempo ci hai impiegato per apportare quella piccola modifica?*

 Nello sviluppo software, tutto cambia, i requisiti di business cambiano, la tecnologia evolve e le persone che lavorano su un progetto cambiano nel tempo, il cambiamento è inevitabile.    
 Per questo motivo, uno degli obiettivi di ogni sviluppatore dovrebbe essere quello di scrivere codice che risponda bene al cambiamento, un aspetto cruciale quando si parla di qualità.

Tutto molto bello, ma come faccio a scrivere codice che sia più flessibile e manutenibile?

## Accoppiamento

Una delle caratteristiche da tenere in considerazione nella programmazione è l'**accoppiamento**.
Più alto sarà il grado di dipendenza tra le classi, più alto sarà l'accoppiamento (*tight coupling*).     
L'obiettivo dovrebbe essere quello di scrivere delle classi che non dipendano fortemente l'una dalle altre, cercando così di ridurre l'accoppiamento (*loose coupling*).

*Si dice che c'è una **dipendenza** tra due classi **quando una classe A utilizza** o dipende da **una classe B** per eseguire determinate operazioni.*

Vediamo un esempio di forte dipendenza tra due classi.
```java
class MySqlCustomerRepository {
    public int[] ages() {
        return new int[] { 21, 34, 54, 18 };
    }
}

class CustomersCalculatorService {

    MySqlCustomerRepository repository;

    public CustomersCalculatorService() {
        //Istanziamo direttamente la classe MySqlCustomerRepository
        this.repository = new MySqlCustomerRepository();
    }

    public int findOldest() {
        return Arrays.stream(repository.ages()).max().orElse(0);
    }
}
```

In questo esempio la classe *CustomersCalculatorService* dipende fortemente dalla classe *MySqlCustomerRepository*.

La classe *MySqlCustomerRepository* viene istanziata direttamente nel costruttore di *CustomersCalculatorService* e questo crea un forte accoppiamento tra le due classi.

Se questo approccio venisse utilizzato in tutta la nostra codebase, se per esempio, volessimo sostituire il tipo di database con un DB Postgres, dovremmo andare a modificare diversi punti della nostra applicazione.

Una soluzione per ridurre questo accoppiamento è l'utilizzo della *Dependency Injection*.

## Dependency Injection

La **Dependency Injection** è una tecnica che ci permette di disaccoppiare la creazione di un oggetto dal suo effettivo utilizzo.   
Per raggiungere questo obiettivo, l'inizializzazione dei collaboratori viene fatta all'esterno e si dice che vengono *iniettati* come dipendenze nei client che hanno bisogno di utilizzarli.

Esistono 3 tipi di dependency injection:
1. Constructor injection
1. Setter injection
2. Interface injection

Vediamo come applicarli alla classe CustomersCalculatorService.
### Constructor injection
In questo tipo di dependency injection la dipendenza viene passata come parametro al costruttore, è il metodo più comune ed utilizzato di dependency injection.     
Utilizzare questa tecnica ci assicura che il client sarà sempre in uno stato valito in quanto non potrà essere inizializzato senza le sue dipendenze.

```java
class CustomersCalculatorService {

    MySqlCustomerRepository repository;

    //Passiamo la dipendenza come parametro del costruttore
    public CustomersCalculatorService(MySqlCustomerRepository repository) {
        this.repository = repository;
    }

    public int findOldest() {
        return Arrays.stream(repository.ages()).max().orElse(0);
    }
}
```


### Setter injection
La classe client espone un metodo setter utilizzato per iniettare la dipendenza. Dal momento in cui il client viene inizializzato la sua dipendenza può essere iniettata in qualsiasi momento.  Questa tecnica ci permette di cambiare la dipendenza utilizzata a runtime, ma non ci assiucura che il client sia sempre in uno stato valido.
```java
class CustomersCalculatorService {

    private CustomerRepository repository;

    //Utilizziamo un setter per iniettare la dipendenza
    public void setRepository(CustomerRepository repository) {
        this.repository = repository;
    }

    public int findOldest() {
        return Arrays.stream(repository.ages()).max().orElse(0);
    }
}
```

### Interface injection
Simile alla setter injection, in questo caso, la classe client implementa un interfaccia che definisce un metodo che sarà utilizzato per iniettare la dipendenza. Anche questa tecnica ci può offrire una certa flessibilà, ma non assicura che il client sia sempre in uno stato valido.

```java
interface RepositorySetter {
    public void inject(CustomerRepository service);
}

class CustomersCalculatorService implements RepositorySetter {

    private CustomerRepository repository;
    
    public void inject(CustomerRepository repository) {
        this.repository = repository;
    }

    public int findOldest() {
        return Arrays.stream(repository.ages()).max().orElse(0);
    }
}
```


Quello che faremo sarà *iniettare* nel costruttore della classe CustomersCalculatorService la sua dipendenza MySqlCustomerRepository.

La responsabilità di inizializzazione e configurazione di questa dipendenza viene tolta dal client per essere demandata ad un componente esterno.

Questa tecnica, inoltre, viene spesso utilizzata assieme al principio SOLID di inversione delle dipendenze *(Dependency Inversion Principle)*.

## Dependency Inversion Principle

> a. High-level modules should not depend on low-level modules. Both should depend on abstractions.
> 
> b. Abstractions should not depend on details. Details should depend on abstractions.
> 
>-- Robert C. Martin (Uncle Bob)

In sostanza secondo questo ptincipio le nostre classi dovrebbero dipendere da delle astrazioni e non dalle classi concrete.

Vediamo come possiamo ridurre l'accoppiamento utilizzando un astrazione della classe MySqlCustomerRepository:

```java
//Aggiungiamo l'interfaccia CustomerRepository
interface CustomerRepository {
    int[] ages();
}

//Implementiamo l'interfaccia che abbiamo creato
class MySqlCustomerRepository implements CustomerRepository {
    public int[] ages() {
        return new int[]{21, 34, 54, 18};
    }
}

class CustomersCalculatorService {

    CustomerRepository repository;

    //Utilizziamo l'interfaccia come parametro del costruttore
    public CustomersCalculatorService(CustomerRepository repository) {
        this.repository = repository;
    }

    public int findOldest() {
        return Arrays.stream(repository.ages()).max().orElse(0);
    }
}
```

Quello che abbiamo fatto è stato introdurre l'interfaccia *CustomerRepository*, che viene implementata da *MySqlCustomerRepository* ed invece di utilizzare la classe concreta come parametro del costruttore di *CustomersCalculatorService* utilizziamo l'interfaccia.

Adesso la classe *CustomersCalculatorServic*e non dipenderà più dalla classe *MySqlCustomerRepository*, ma dalla sua interfaccia *CustomerRepository*.

Che vantaggi ci porta l'utilizzo di questo approccio ?

Adesso possiamo usare come dipendenza qualsiasi classe che implementa l'interfaccia CustomerRepository.     
Se dovessimo, per esempio, sostituire il tipo di database, quello che faremo sarà introdurre una nuova classe che implementa l'interfaccia corretta.

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

//Creiamo una nuova classe che implementa l'interfaccia CustomerRepository
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

Abbiamo creato le nuova classe *DynamoDbCustomerRepository* che implementa l'interfaccia *CustomerRepository* in modo da poterla iniettare in CustomersCalculatorService.   

Non abbiamo modificato direttamente la classe CustomersCalculatorService, ma abbiamo esteso il nostro sistema aggiungendo una nuova classe.

Se volessimo aggiungere un nuovo tipo di database basterebbe creare un ulteriore classe che implementa l'interfaccia CustomerRepository.

Il compito di configurare le dipendenze e inizializzarle decidendo quali iniettare nel client sarà demandato ad un componente esterno, che è il comportamento alla base dell'Inversion of Control (IoC)

## Inversion of Control

L'Inversion of Control è un principio (spesso utilizzato con la Dependency Injection) secondo il quale la creazione dei nostri oggetti e la creazione delle loro dipendenze non avviene
all'interno delle classi, ma è delegata ad un componente esterno o un framework, invertendo così il flusso di esecuzione dell'applicazione.

Come iniettiamo le dipendenze:
```java
public class DemoApplication {

    public static void main(String[] args) {

        var mysql = new MySqlCustomerRepository();
        var dynamoDB = new DynamoDbCustomerRepository();
        var calculator = new CustomersCalculatorService(dynamoDB);

        var oldest = calculator.findOldest();

        System.out.println("The oldest customer is: " + oldest);
    }
}
```

La classe sopra, rappresenta il punto di ingresso della nostra applicazione.
Come potrai intuire utilizzando questo approccio l'applicazione diventa più flessibile e modulare, ma implica un piccolo tradeoff, stiamo aggiungendo un livello di complessità.

Nell'esempio fornito la classe *DemoApplication* può sembrare semplice, ma in applicazioni reali e più complesse, le classi da configurare sono diverse e bisogna stare attenti ed iniettare sempre le dipendenze corrette nel punto giusto.

Per aiutarci in questo ci sono diversi framework che possiamo utilizzare.
In Java il più famoso e ampliamente utilizzato è il framework Spring, che basa il suo funzionamento proprio sulla Dependency Injection e sull'Inversion of Control.

Spring infatti delega la creazione e la configurazione degli oggetti e delle loro dipendenze all'IoC Container.
In questo modo l'inizializzazione delle classi non avviene a livello applicativo, permettendoi di concentrarci sulla business logic.


```java
...

@Component
class MySqlCustomerRepository implements CustomerRepository {
    public int[] ages() {
        return new int[]{21, 34, 54, 18};
    }
}

@Component
@Primary
class DynamoDbCustomerRepository implements CustomerRepository {
    public int[] ages() {
        return new int[]{101, 304, 504, 188};
    }
}

@Component
class CustomersCalculatorService {

    @Autowired
    private CustomerRepository repository;

    public int findOldest() {
        return Arrays.stream(repository.ages()).max().orElse(0);
    }
}

@Configuration
@ComponentScan
public class DemoApplication {

    public static void main(String[] args) {

        try (var context = new AnnotationConfigApplicationContext(DemoApplication.class)) {

            var customerService = context.getBean(CustomersCalculatorService.class);

            var oldest = customerService.findOldest();

            System.out.println("The oldest customer is: " + oldest);
        }

    }
}
```

## Conclusione

//TODO Scrivere la conclusione