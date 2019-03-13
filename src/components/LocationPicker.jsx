import React from "react";
import PropTypes from 'prop-types';

import { send } from '../flux.js';
import { getLocationSuggestions } from '../sagas.js';

export default class LocationPicker extends React.Component {
  static propTypes = {
    location: PropTypes.shape({
      name: PropTypes.string
    }),
    helpText: PropTypes.string,
    onSuggestionPicked: PropTypes.func
  }

  state = {
    isEditing: false,
    suggestions: null
  }

  componentWillUnmount() {
    if (this.suggestionsSource) {
      this.suggestionsSource.return();
    }
  }

  onEdit = () => {
    this.setState({isEditing: true});
    this.acceptSuggestions();
  }

  onQuery = (e) => {
    const query = e.target.value;

    if (query.length > 2){
      send('locations:query', query);
    }
  }

  onSuggestionPicked = (suggestion) => {
    this.setState({
      isEditing: false,
      suggestions: []
    });

    this.props.onSuggestionPicked(suggestion);
  }

  async acceptSuggestions() {
    this.suggestionsSource = getLocationSuggestions();

    for await (const suggestions of this.suggestionsSource) {
      if (suggestions) {
        this.setState({ suggestions });
      }
    }
  }

  render() {
    const { isEditing, suggestions } = this.state;
    const { location, helpText } = this.props;

    const locationLabel = (
      <p>
        { location ? location.name || 'Unknown' : null }
        <button onClick={this.onEdit}>{helpText}</button>
      </p>
    );
    const locationInput = <input type="text" onChange={this.onQuery} autoFocus/>;

    const suggestionList = suggestions && isEditing && (
        <ul>
          {suggestions.map(suggestion => (
            <li key={suggestion.id} onClick={() => this.onSuggestionPicked(suggestion)}>{ suggestion.name }</li>
          ))}
        </ul>
    );

    return (
      <form>
        { isEditing ? locationInput : locationLabel }
        { suggestionList }
      </form>
    );
  }
}
