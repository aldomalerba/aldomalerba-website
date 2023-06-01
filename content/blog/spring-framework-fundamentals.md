---
external: false
draft: false
title: "Ridurre l'accoppiamento e migliorare la qualità del codice con la Dependency Injection"
description: "Introduzione ai concetti principali di Spring Framework come Dependency Injection e Depenency Inversion Principle."
date: 2022-11-02
---

## Introduzione

> "C'è stato un cambio nei riquisiti di business e dovremmo apportare questa piccola modifica"

 *Quante volte ti è capitato di sentire una frase simile? Quanto tempo ci hai impiegato per apportare quella piccola modifica?*

 Nello sviluppo software, tutto cambia, i requisiti di business cambiano, la tecnlogia evolve e le persone cha lavorano su un progetto cambiano nel tempo, il cambiamento è inevitabile.    
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

Se questo approcio venisse utilizzato in tutta la nostra codebase, se per esempio, volessimo sostituire il tipo di database con un db Postgres, dovremmo andare a modificare diversi punti della nostra applicazione.

Una soluzione per ridurre questo accoppiamento è l'utilizzo della *Dependency Injection*.

## Dependency Injection

La **Dependency Injection** è una tecnica che ci permette di disaccoppiare la creazione di un oggetto dal suo effettivo utilizzo.   
Per raggiungere questo obiettivo, l'inizializzazione dei collaboratori viene fatta all'esterno e si dice che vengono *iniettati* come dipendenze nei client che hanno bisgno di utilizzarli.

Esistono 3 tipi di dependency injection:

1. **Constructor injection:** La dipendenza viene passata come parametro al costruttore.
2. **Setter injection:** La classe client espone un metodo setter utilizzato per iniettare la dipendenza.
3. **Interface injection:** Simile alla setter injection, in questo caso, la classe client implementa un interfaccia che definisce un metodo che sarà utilizzato per iniettare la dipendenza.

Vediamo come possiamo applicare la dependency injection alla classe CustomersCalculatorService utilizzando la constructor injection:
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

Quello che faremo sarà *iniettare* nel costruttore della classe CustomersCalculatorService la sua dipendenza MySqlCustomerRepository.

La responsabilità di inizializzazione e configurazione di questa dipendenza viene tolta dal client per essere demandata ad un compoenente esterno.

Questa tecnica, inoltre, viene spesso utilizzata assieme al principio SOLID di inversione delle dipendenze *(Dependency Inversion Principle)*.

## Dependency Inversion Principle

> a. High-level modules should not depend on low-level modules. Both should depend on abstractions.
> 
> b. Abstractions should not depend on details. Details should depend on abstractions.
> 
>-- Robert C. Martin (Uncle Bob)

In sostanza le nostre classi dovrebbero dipendere da delle astrazioni e non dalle classi concrete.

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

Che vantaggi ci porta l'utilizzo di questo approcio ?

Adesso possiamo usare come dipendenza qualsiasi classe che implementa l'interfaccia CustomerRepository.     
Se dovessimo per esempio sostituire il tipo di database, quello che faremo sarà introdurre una nuova classe che implementa l'interfaccia corretta.

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

Se volessimo aggiungere un nuovo tipo di database ci basterebbe creare una uleriore classe che implementa l'interfaccia CustomerRepository.

Il compito di configutare le dipendenze e inizializzarle decidendo quali iniettare nel lostro client sarà demandato ad un componente esterno.

## Inversion of Control

L'Inversion of Control è un principio (spesso utilizzato col la Dependency Injection) secondo il quale la creazione dei nostri oggetti e la creazione delle loro dipendenze non avviene
all'interno delle classi, ma è delegata ad un componente esterno o un framework.

Come iniettiamo le dipendenze:
```java


public class DemoApplication {

    public static void main(String[] args) {

        //var repository = new MySqlCustomerRepository();
        var repository = new DynamoDbCustomerRepository();
        var calculator = new CustomersCalculatorService(repository);

        var oldest = calculator.findOldest();

        System.out.println("The oldest customer is: " + oldest);
    }
}
```

La classe sopra rappresenta l'entry point della nostra applicazione.
Come potrai intuire utilizzando questo approcio l'applicazione diventa più flessibile e modulare, ma implica un piccolo tradeoff, stiamo aggiungendo un livello di complessità.

Nell'esempio fornito sopra con la classe *DemoApplication* stiamo semplicemente andando ad inizializzare uno dei due repository, inizializziamo il nostro CustomersCalculatorService e gli iniettiamo la dipendenza corretta.
Può sembrare semplice, ma in applicazioni reali e più complesse, le classi da configurare sono diverse e bisogna stare attenti ed iniettare sempre la dipendeze corrette nel punto giusto.

In questo ci sono diversi framework che ci possono aiutare e uno di questo è **Spring**.