
# Implementation instructions

_A guide on how to implement tracking for the generated Event Specifications._

**Table of contents:**
- [Agent Message](#agent-message)
- [User Message](#user-message)
- [Login Success](#login-success)
- [Confirm Payment](#confirm-payment)
- [Select a Plan](#select-a-plan)
- [Ad Click](#ad-click)
- [Personal Details](#personal-details)
- [Quick Search](#quick-search)
- [Enter Subscription Flow](#enter-subscription-flow)
- [Full Search](#full-search)
- [Article View](#article-view)
- [Ad Impression](#ad-impression)


## [Agent Message](https://console.snowplowanalytics.com/b12539df-a711-42bd-bdfa-175308c55fd5/data-products/fb649b24-5201-404f-a0ae-3fcc5d621271/event-specifications/79fa7504-66b1-4e96-9484-5aedca6cb3f6)

|       |  |
| ----------- | ----------- |  
| **Id** | 79fa7504-66b1-4e96-9484-5aedca6cb3f6 |
| **Version** | 2 |
| **Data Product Id** | fb649b24-5201-404f-a0ae-3fcc5d621271 | 
| **Source Application/s** | The Daily Query - Media & Publishing - Web |
| **Event Data Structure** | message_received/1-0-0 |
| **Entity Data Structures** | agent/1-0-0, message/1-0-0 |
| **Code** | [Link](./snowplow.ts#L994) |
| **Data Product Domain** | Product |



#### Entity Cardinality Rules
|    Name   | Required  | Number of entities  |
| ----------- | ----------- |  ----------- |
agent | ✅ | At least `1`
message | ✅ | Exactly `1`




## [User Message](https://console.snowplowanalytics.com/b12539df-a711-42bd-bdfa-175308c55fd5/data-products/fb649b24-5201-404f-a0ae-3fcc5d621271/event-specifications/e604200b-01ff-4da3-aa96-61887f93e7d5)

|       |  |
| ----------- | ----------- |  
| **Id** | e604200b-01ff-4da3-aa96-61887f93e7d5 |
| **Version** | 2 |
| **Data Product Id** | fb649b24-5201-404f-a0ae-3fcc5d621271 | 
| **Source Application/s** | The Daily Query - Media & Publishing - Web |
| **Event Data Structure** | message_sent/1-0-0 |
| **Entity Data Structures** | message/1-0-0 |
| **Code** | [Link](./snowplow.ts#L1069) |
| **Data Product Domain** | Product |



#### Entity Cardinality Rules
|    Name   | Required  | Number of entities  |
| ----------- | ----------- |  ----------- |
message | ✅ | Exactly `1`




## [Login Success](https://console.snowplowanalytics.com/b12539df-a711-42bd-bdfa-175308c55fd5/data-products/ead1f30f-1234-4350-a112-02003991e391/event-specifications/fbda2b20-8c46-4750-833b-bf9cbcaf165e)

|       |  |
| ----------- | ----------- |  
| **Id** | fbda2b20-8c46-4750-833b-bf9cbcaf165e |
| **Version** | 2 |
| **Data Product Id** | ead1f30f-1234-4350-a112-02003991e391 | 
| **Source Application/s** | The Daily Query - Media & Publishing - Web |
| **Event Data Structure** | login/1-0-0 |
| **Entity Data Structures** |  |
| **Code** | [Link](./snowplow.ts#L1119) |
| **Data Product Domain** | Marketing |

### Implementation Instructions for login event properties

#### Property Rules
|    Name   | Required  | Description |  Exact value(s) expected |
| ----------- | ----------- |  ----------- |  ----------- |  
login_status | ❌ | - | `success`





## [Confirm Payment](https://console.snowplowanalytics.com/b12539df-a711-42bd-bdfa-175308c55fd5/data-products/ead1f30f-1234-4350-a112-02003991e391/event-specifications/05f604ca-af39-4f32-8b81-d35ec7c17720)

|       |  |
| ----------- | ----------- |  
| **Id** | 05f604ca-af39-4f32-8b81-d35ec7c17720 |
| **Version** | 6 |
| **Data Product Id** | ead1f30f-1234-4350-a112-02003991e391 | 
| **Source Application/s** | The Daily Query - Media & Publishing - Web |
| **Event Data Structure** | subscription_workflow/1-0-0 |
| **Entity Data Structures** |  |
| **Code** | [Link](./snowplow.ts#L844) |
| **Data Product Domain** | Marketing |

### Implementation Instructions for subscription_workflow event properties

#### Property Rules
|    Name   | Required  | Description |  Exact value(s) expected |
| ----------- | ----------- |  ----------- |  ----------- |  
step_name | ✅ | The name of the step the user is currently on in the subscription workflow. | `confirm_payment`




### Trigger 

#### Screenshot
[<img src="./assets/05f604ca-af39-4f32-8b81-d35ec7c17720_0.png" width="550"/>](./assets/05f604ca-af39-4f32-8b81-d35ec7c17720_0.png)

#### In which application(s) does this trigger apply?

_N/A_

#### The URL of the page on which this event specification triggers:

http://www.thedailyquery.com/subscribe

#### Notes

When the user hits 'Complete Subscription' after entering their payment details


## [Select a Plan](https://console.snowplowanalytics.com/b12539df-a711-42bd-bdfa-175308c55fd5/data-products/ead1f30f-1234-4350-a112-02003991e391/event-specifications/d30cf2d2-23ed-4faa-889b-bb776182d8ab)

|       |  |
| ----------- | ----------- |  
| **Id** | d30cf2d2-23ed-4faa-889b-bb776182d8ab |
| **Version** | 7 |
| **Data Product Id** | ead1f30f-1234-4350-a112-02003991e391 | 
| **Source Application/s** | The Daily Query - Media & Publishing - Web |
| **Event Data Structure** | subscription_workflow/1-0-0 |
| **Entity Data Structures** |  |
| **Code** | [Link](./snowplow.ts#L1044) |
| **Data Product Domain** | Marketing |

### Implementation Instructions for subscription_workflow event properties

#### Property Rules
|    Name   | Required  | Description |  Exact value(s) expected |
| ----------- | ----------- |  ----------- |  ----------- |  
value | ❌ | Whether the user selects a monthly or annual plan | `monthly` or `annually`
step_name | ✅ | The name of the step the user is currently on in the subscription workflow. | `select_plan`




### Trigger 

#### Screenshot
[<img src="./assets/d30cf2d2-23ed-4faa-889b-bb776182d8ab_0.png" width="550"/>](./assets/d30cf2d2-23ed-4faa-889b-bb776182d8ab_0.png)

#### In which application(s) does this trigger apply?

_N/A_

#### The URL of the page on which this event specification triggers:

http://www.thedailyquery.com/subscribe

#### Notes

When a user picks a plan


## [Ad Click](https://console.snowplowanalytics.com/b12539df-a711-42bd-bdfa-175308c55fd5/data-products/58526f0a-c5b6-4d08-bc4f-199836217d0c/event-specifications/5f04be54-cc64-4e50-90f6-a85df727a50e)

|       |  |
| ----------- | ----------- |  
| **Id** | 5f04be54-cc64-4e50-90f6-a85df727a50e |
| **Version** | 7 |
| **Data Product Id** | 58526f0a-c5b6-4d08-bc4f-199836217d0c | 
| **Source Application/s** | The Daily Query - Media & Publishing - Web |
| **Event Data Structure** | ad_interaction/1-0-0 |
| **Entity Data Structures** | ad/1-0-0 |
| **Code** | [Link](./snowplow.ts#L919) |
| **Data Product Domain** | Marketing |

### Implementation Instructions for ad_interaction event properties

#### Property Rules
|    Name   | Required  | Description |  Exact value(s) expected |
| ----------- | ----------- |  ----------- |  ----------- |  
type | ✅ | The type of ad interaction | `click`


#### Entity Cardinality Rules
|    Name   | Required  | Number of entities  |
| ----------- | ----------- |  ----------- |
ad | ✅ | Exactly `1`



### Trigger 

#### Screenshot
[<img src="./assets/5f04be54-cc64-4e50-90f6-a85df727a50e_0.png" width="550"/>](./assets/5f04be54-cc64-4e50-90f6-a85df727a50e_0.png)

#### In which application(s) does this trigger apply?

`media-publishing-web` 

#### The URL of the page on which this event specification triggers:

_N/A_

#### Notes

When an advertising element is click on by the user


## [Personal Details](https://console.snowplowanalytics.com/b12539df-a711-42bd-bdfa-175308c55fd5/data-products/ead1f30f-1234-4350-a112-02003991e391/event-specifications/3962b139-d376-4ff3-9554-e78df3332676)

|       |  |
| ----------- | ----------- |  
| **Id** | 3962b139-d376-4ff3-9554-e78df3332676 |
| **Version** | 3 |
| **Data Product Id** | ead1f30f-1234-4350-a112-02003991e391 | 
| **Source Application/s** | The Daily Query - Media & Publishing - Web |
| **Event Data Structure** | subscription_workflow/1-0-0 |
| **Entity Data Structures** |  |
| **Code** | [Link](./snowplow.ts#L894) |
| **Data Product Domain** | Marketing |

### Implementation Instructions for subscription_workflow event properties

#### Property Rules
|    Name   | Required  | Description |  Exact value(s) expected |
| ----------- | ----------- |  ----------- |  ----------- |  
step_name | ✅ | The name of the step the user is currently on in the subscription workflow. | `personal_details`




### Trigger 

#### Screenshot
[<img src="./assets/3962b139-d376-4ff3-9554-e78df3332676_0.png" width="550"/>](./assets/3962b139-d376-4ff3-9554-e78df3332676_0.png)

#### In which application(s) does this trigger apply?

_N/A_

#### The URL of the page on which this event specification triggers:

http://www.thedailyquery.com/subscribe

#### Notes

When the user hits 'continue' after entering their personal details


## [Quick Search](https://console.snowplowanalytics.com/b12539df-a711-42bd-bdfa-175308c55fd5/data-products/98f633e6-ab32-43a8-8e07-0d6124da0ee7/event-specifications/73383b45-f16a-4249-b7d1-3edf0731713b)

|       |  |
| ----------- | ----------- |  
| **Id** | 73383b45-f16a-4249-b7d1-3edf0731713b |
| **Version** | 5 |
| **Data Product Id** | 98f633e6-ab32-43a8-8e07-0d6124da0ee7 | 
| **Source Application/s** | The Daily Query - Media & Publishing - Web |
| **Event Data Structure** | search_performed/1-0-0 |
| **Entity Data Structures** | article/1-0-0 |
| **Code** | [Link](./snowplow.ts#L969) |
| **Data Product Domain** | Product |

### Implementation Instructions for search_performed event properties

#### Property Rules
|    Name   | Required  | Description |  Exact value(s) expected |
| ----------- | ----------- |  ----------- |  ----------- |  
term | ✅ | The search term entered by the user. | -
search_type | ❌ | - | `quick`


#### Entity Cardinality Rules
|    Name   | Required  | Number of entities  |
| ----------- | ----------- |  ----------- |
article | ✅ | Exactly `1`



### Trigger 

#### Screenshot
[<img src="./assets/73383b45-f16a-4249-b7d1-3edf0731713b_0.png" width="550"/>](./assets/73383b45-f16a-4249-b7d1-3edf0731713b_0.png)

#### In which application(s) does this trigger apply?

_N/A_

#### The URL of the page on which this event specification triggers:

_N/A_

#### Notes

Fire this event when the user selects an article from the suggestions dropdown in the search box


## [Enter Subscription Flow](https://console.snowplowanalytics.com/b12539df-a711-42bd-bdfa-175308c55fd5/data-products/ead1f30f-1234-4350-a112-02003991e391/event-specifications/eca878e2-aa58-48d5-b3dd-86980ec2fc03)

|       |  |
| ----------- | ----------- |  
| **Id** | eca878e2-aa58-48d5-b3dd-86980ec2fc03 |
| **Version** | 3 |
| **Data Product Id** | ead1f30f-1234-4350-a112-02003991e391 | 
| **Source Application/s** | The Daily Query - Media & Publishing - Web |
| **Event Data Structure** | subscription_workflow/1-0-0 |
| **Entity Data Structures** |  |
| **Code** | [Link](./snowplow.ts#L1094) |
| **Data Product Domain** | Marketing |

### Implementation Instructions for subscription_workflow event properties

#### Property Rules
|    Name   | Required  | Description |  Exact value(s) expected |
| ----------- | ----------- |  ----------- |  ----------- |  
step_name | ✅ | The name of the step the user is currently on in the subscription workflow. | `begin_workflow`




### Trigger 

#### Screenshot
[<img src="./assets/eca878e2-aa58-48d5-b3dd-86980ec2fc03_0.png" width="550"/>](./assets/eca878e2-aa58-48d5-b3dd-86980ec2fc03_0.png)

#### In which application(s) does this trigger apply?

_N/A_

#### The URL of the page on which this event specification triggers:

http://www.thedailyquery.com/subscribe

#### Notes

When a user lands on the subscription page


## [Full Search](https://console.snowplowanalytics.com/b12539df-a711-42bd-bdfa-175308c55fd5/data-products/98f633e6-ab32-43a8-8e07-0d6124da0ee7/event-specifications/c2a5edb5-594f-444f-9d22-eed1081b41bf)

|       |  |
| ----------- | ----------- |  
| **Id** | c2a5edb5-594f-444f-9d22-eed1081b41bf |
| **Version** | 5 |
| **Data Product Id** | 98f633e6-ab32-43a8-8e07-0d6124da0ee7 | 
| **Source Application/s** | The Daily Query - Media & Publishing - Web |
| **Event Data Structure** | search_performed/1-0-0 |
| **Entity Data Structures** | article/1-0-0 |
| **Code** | [Link](./snowplow.ts#L1019) |
| **Data Product Domain** | Product |

### Implementation Instructions for search_performed event properties

#### Property Rules
|    Name   | Required  | Description |  Exact value(s) expected |
| ----------- | ----------- |  ----------- |  ----------- |  
term | ✅ | The search term entered by the user. | -
search_type | ❌ | - | `full`


#### Entity Cardinality Rules
|    Name   | Required  | Number of entities  |
| ----------- | ----------- |  ----------- |
article | ❌ | Between `0` and `99`



### Trigger 

#### Screenshot
[<img src="./assets/c2a5edb5-594f-444f-9d22-eed1081b41bf_0.png" width="550"/>](./assets/c2a5edb5-594f-444f-9d22-eed1081b41bf_0.png)

#### In which application(s) does this trigger apply?

_N/A_

#### The URL of the page on which this event specification triggers:

_N/A_

#### Notes

Fire this event when the user is taken to the results page for their search


## [Article View](https://console.snowplowanalytics.com/b12539df-a711-42bd-bdfa-175308c55fd5/data-products/98f633e6-ab32-43a8-8e07-0d6124da0ee7/event-specifications/207d6f27-a125-402a-b515-d40064d0f1c4)

|       |  |
| ----------- | ----------- |  
| **Id** | 207d6f27-a125-402a-b515-d40064d0f1c4 |
| **Version** | 10 |
| **Data Product Id** | 98f633e6-ab32-43a8-8e07-0d6124da0ee7 | 
| **Source Application/s** | The Daily Query - Media & Publishing - Web |
| **Event Data Structure** | article_interaction/1-0-0 |
| **Entity Data Structures** | article/1-0-0 |
| **Code** | [Link](./snowplow.ts#L869) |
| **Data Product Domain** | Product |

### Implementation Instructions for article_interaction event properties

#### Property Rules
|    Name   | Required  | Description |  Exact value(s) expected |
| ----------- | ----------- |  ----------- |  ----------- |  
type | ✅ | The type of article interaction | `view`


#### Entity Cardinality Rules
|    Name   | Required  | Number of entities  |
| ----------- | ----------- |  ----------- |
article | ✅ | Exactly `1`



### Trigger 

#### Screenshot
[<img src="./assets/207d6f27-a125-402a-b515-d40064d0f1c4_0.png" width="550"/>](./assets/207d6f27-a125-402a-b515-d40064d0f1c4_0.png)

#### In which application(s) does this trigger apply?

`media-publishing-web` 

#### The URL of the page on which this event specification triggers:

_N/A_

#### Notes

When a user loads the full page of an article


## [Ad Impression](https://console.snowplowanalytics.com/b12539df-a711-42bd-bdfa-175308c55fd5/data-products/58526f0a-c5b6-4d08-bc4f-199836217d0c/event-specifications/6511cf68-d715-4729-b83e-4c7ede68ccbb)

|       |  |
| ----------- | ----------- |  
| **Id** | 6511cf68-d715-4729-b83e-4c7ede68ccbb |
| **Version** | 11 |
| **Data Product Id** | 58526f0a-c5b6-4d08-bc4f-199836217d0c | 
| **Source Application/s** | The Daily Query - Media & Publishing - Web |
| **Event Data Structure** | ad_interaction/1-0-0 |
| **Entity Data Structures** | ad/1-0-0 |
| **Code** | [Link](./snowplow.ts#L944) |
| **Data Product Domain** | Marketing |

### Implementation Instructions for ad_interaction event properties

#### Property Rules
|    Name   | Required  | Description |  Exact value(s) expected |
| ----------- | ----------- |  ----------- |  ----------- |  
type | ✅ | The type of ad interaction | `impression`


#### Entity Cardinality Rules
|    Name   | Required  | Number of entities  |
| ----------- | ----------- |  ----------- |
ad | ✅ | Exactly `1`



### Trigger 

#### Screenshot
[<img src="./assets/6511cf68-d715-4729-b83e-4c7ede68ccbb_0.png" width="550"/>](./assets/6511cf68-d715-4729-b83e-4c7ede68ccbb_0.png)

#### In which application(s) does this trigger apply?

_N/A_

#### The URL of the page on which this event specification triggers:

_N/A_

#### Notes

When an ad or sponsorship is visible to the user

