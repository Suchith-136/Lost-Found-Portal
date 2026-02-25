import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";

interface ClaimFormProps {
  onSubmit: (claim: any) => void;
  onCancel: () => void;
}

export function ClaimForm({ onSubmit, onCancel }: ClaimFormProps) {
  const [formData, setFormData] = useState({
    itemId: "",
    description: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    address: "",
    story: "",
    distinctive: "",
    reward: "",
    preferredContact: "email",
    verification: false,
    terms: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.verification || !formData.terms) {
      alert("Please agree to the verification and terms");
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h3>Item Information</h3>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="itemId">Item ID or Name *</Label>
        <Input
          id="itemId"
          placeholder="Enter the item ID or name from the listing"
          value={formData.itemId}
          onChange={(e) => setFormData({ ...formData, itemId: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Describe the Item *</Label>
        <Textarea
          id="description"
          placeholder="Describe the item you're claiming in detail (color, brand, model, distinctive features, etc.)"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
          required
        />
      </div>

      <div>
        <h3>Your Contact Information</h3>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contactName">Your Name *</Label>
        <Input
          id="contactName"
          placeholder="Your full name"
          value={formData.contactName}
          onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contactEmail">Email Address *</Label>
        <Input
          id="contactEmail"
          type="email"
          placeholder="your@email.com"
          value={formData.contactEmail}
          onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contactPhone">Phone Number *</Label>
        <Input
          id="contactPhone"
          type="tel"
          placeholder="9876543210"
          value={formData.contactPhone}
          onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address *</Label>
        <Textarea
          id="address"
          placeholder="Your complete address for item delivery"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          rows={3}
          required
        />
      </div>

      <div>
        <h3>Additional Information</h3>
      </div>

      <div className="space-y-2">
        <Label htmlFor="story">How did you lose the item? *</Label>
        <Textarea
          id="story"
          placeholder="Tell us the story of how you lost this item (when, where, circumstances)"
          value={formData.story}
          onChange={(e) => setFormData({ ...formData, story: e.target.value })}
          rows={3}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="distinctive">Distinctive Features *</Label>
        <Textarea
          id="distinctive"
          placeholder="Describe any unique features, scratches, stickers, or modifications that only you would know"
          value={formData.distinctive}
          onChange={(e) => setFormData({ ...formData, distinctive: e.target.value })}
          rows={3}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="reward">Willing to pay reward? (Optional)</Label>
        <Input
          id="reward"
          type="number"
          placeholder="Amount in ₹"
          min="0"
          value={formData.reward}
          onChange={(e) => setFormData({ ...formData, reward: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="preferredContact">Preferred Contact Method</Label>
        <Select value={formData.preferredContact} onValueChange={(value) => setFormData({ ...formData, preferredContact: value })}>
          <SelectTrigger id="preferredContact">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="phone">Phone Call</SelectItem>
            <SelectItem value="whatsapp">WhatsApp</SelectItem>
            <SelectItem value="any">Any method</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="verification"
          checked={formData.verification}
          onCheckedChange={(checked) => setFormData({ ...formData, verification: checked as boolean })}
          required
        />
        <label htmlFor="verification" className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          I understand that I may be asked to provide additional verification and that false claims may result in account suspension
        </label>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="terms"
          checked={formData.terms}
          onCheckedChange={(checked) => setFormData({ ...formData, terms: checked as boolean })}
          required
        />
        <label htmlFor="terms" className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          I agree to the terms of service and privacy policy
        </label>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">
          Submit Claim Request
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
