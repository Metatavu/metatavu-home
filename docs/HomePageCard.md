# HomepageCard -component

HomepageCard is a re-usable component for rendering cards on home page for both admin and employee.
It can be dragged and dropped if `editmode` is on. Link to corresponding screen is (and should be) only in cards title, and should not be clickable in editing.

For more information regarding the design of the component, please see [figma](https://www.figma.com/design/5dWTUXcmd8GjK2kT1Ti4CN/Metatavu-home-2026?node-id=764-2234).

## Dos and Don'ts

### Do
- Use clear hierarchy with concise titles, values, and supporting details
- Keep cards focused on the most important information

### Don't
- Place cards next to each other that can't do that
- Overload cards with too much content
- Use inconsistent card sizes or layouts without purpose


## Properties

|Property         |Type                     |Description                                                         |
|-----------------|-------------------------|--------------------------------------------------------------------|
|`title`          | string \| undefined     |Title of the card. Should be a localization string                  |
|`content`        | JSX.Element             |Content of the card. Defined separately for each card component     |
|`path`           | string  \| undefined    |Path for the screen corresponding the card. Used for link           |
|`hidden`         | boolean                 |Defines if the card is hidden or not. Changed with `onToggleHidden` |
|`onToggleHidden` | (arg0: boolean) => void |Changes value of `hidden`                                           |
|`editmode`       | boolean                 |Defines if edit mode is on                                          |


## Usage example

```tsx
const exampleHomepageCard = ({hidden, onToggleHidden, editmode}: CardProps) => {
  const path = "/example/screen";

  const renderExampleCard = () => {
    return (
      <Box>
        //...Card content
      </Box>
    );
  };
  
  return(
    <HomepageCard 
      title={strings.example.title}
      content={renderExampleCard()}
      path={path}
      hidden={hidden}
      onToggleHidden={onToggleHidden}
      editmode={editmode}
    />
  );
};
```

It would result in following:
![Example card](/docs/imgs/example_card.png)
Editmode:
![Example card edit](/docs/imgs/example_card_edit.png)
Hidden:
![Example card hidden](/docs/imgs/example_card_hidden.png)