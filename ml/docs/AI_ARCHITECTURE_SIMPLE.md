# The AI architecture in everyday language

The system is a research library, a material finder, a checklist and a calculator working together. It does not ask one chatbot to decide everything.

## First: prepare the research library

The authors' dataset gives us links such as “this residual material may be processed into that useful resource”. Each link has a process description and research references. We organize those links so the backend can look them up quickly.

This library does not tell us who has stock today, the price of a shipment, or whether a particular batch will satisfy a buyer. Marketplace listings and buyer requirements provide that information.

## Second: understand what the companies mean

The supplier says what it has. The buyer says what it currently purchases, what it intends to do, and what properties it needs.

In the default mode, the system recognizes exact names and selected alternative names, then compares keywords. If semantic mode is enabled, a pretrained MiniLM model turns material descriptions into lists of numbers that represent their meaning. Similar meanings can then be retrieved even when wording differs. We did not train or fine-tune MiniLM.

The embedding model is a search helper. Similar descriptions do not establish equal composition or safe substitution.

## Third: connect a research route to real inventory

The finder connects an active supplier listing to a research-supported input and follows the library link to the buyer's desired output:

Supplier's material → possible processing route → useful resource → buyer's requirement.

For example, a slag-to-aggregate route can suggest that a slag listing deserves examination for an aggregate buyer. It does not establish that raw slag can be used directly, or that every slag batch has the same properties.

## Fourth: run the practical checklist

Rules compare known material properties, quantity, availability dates, processing needs and input dependencies. Each check says:

- Pass: the recorded information meets this condition.
- Fail: the recorded information contradicts it.
- Unknown: information is missing or insufficient.

A good price cannot erase a failed essential specification. If a report measures the residual input, the system does not pretend it measures the processed output. If multiple ingredients are required, a reviewed route keeps those ingredients together. Old graph records with missing context trigger a request to inspect the source.

## Fifth: calculate usable output and potential savings

The calculator compares equivalent useful output. If processing loses 20% of the input, producing 100 tonnes of useful output requires 125 tonnes of input. It adds purchase, processing, delivery and other recorded costs, then compares them with the buyer's existing delivered cost.

Missing costs stay unknown. A lower and upper estimate reflect supplied assumptions, not a model's certainty. Environmental estimates likewise need explicit factors; no carbon saving is invented.

## Sixth: put useful opportunities first and explain them

A transparent scoring formula considers known fit, usable quantity, evidence, savings and proximity. We have not trained a ranking model. The score is an ordering aid, not a percentage chance of success.

The frontend receives the proposed route, references, checks, savings estimate, unresolved questions and next actions. The explanation is assembled from those results; a generative chatbot is not required.

## Seventh: keep the opportunity moving

The system records the opportunity. If it is confidential, both companies must agree before contacts are revealed. The companies can log sample and trial stages; feedback does not automatically certify suitability. Negotiation and the actual exchange continue in the main marketplace.

## What is actually AI here?

The pretrained embedding model is the ML part when semantic mode is enabled. The research graph is external knowledge. Feasibility checks, ranking, privacy and cost calculations are our application logic. An optional LLM can assist with extracting fields from existing document text, but that connection is currently disabled and its drafts require review.

The intended benefit is to turn a large library of possibilities into a short list of relevant, explainable opportunities with clear next steps. Actual company adoption and successful material use still need testing.
